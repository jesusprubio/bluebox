#!/usr/bin/env node

// Copyright Jesus Perez <jesusprubio gmail com>
//           Antonio Carrasco <ancahy2600 gmail com>
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const readline = require('readline');

const async = require('async');
const lodash = require('lodash');
const shell = require('shelljs');

const Bluebox = require('../');
const logger = require('../lib/utils/logger');

const prompt = 'Bluebox-ng> ';
const portFromTransport = {
  udp: 5060,
  tcp: 5060,
  tls: 5061,
  ws: 8080,
  wss: 4443,
};
const modulesGeneralOptions = {};
const modulesSetVars = [];

let modulesInfo = {};
let modulesList = [];
let exitNext = false;
let bluebox = null;
let autoCompType = 'command';

function completer(line) {
  let completions;
  let hits;
  let tmpLine;
  switch (autoCompType) {
    case 'command':
      completions = modulesList.join(' ');
      if (line.indexOf('help ') !== -1) {
        tmpLine = line.substring(5);
        hits = modulesList.filter((c) => c.indexOf(tmpLine) === 0);
      } else {
        tmpLine = line;
        hits = modulesList.filter((c) => c.indexOf(tmpLine) === 0);
      }
      break;
    case 'variable':
      completions = modulesSetVars.join(' ');
      tmpLine = line;
      hits = modulesSetVars.filter((c) => c.indexOf(tmpLine) === 0);

      break;
    default:
      completions = [];
      hits = 0;
  }
  return [(hits.length + 1 ? hits : completions), tmpLine];
}


function runModule(moduleName, readStream) {
  const moduleInfo = modulesInfo[moduleName].help;
  const moduleOptions = {};
  let chosenTransport = null;

  function cb(err, result) {
    logger.bold('\nRESULT:\n');
    if (!err) {
      if (!result || result.length === 0) {
        logger.highlight('No result');
      } else {
        logger.json(result);
      }
    } else {
      logger.error(`ERROR: run(): ${JSON.stringify(err)}`);
    }
    logger.regular('\n');
    readStream.prompt();
  }

  // Asking for the parameters (if any)
  if (!moduleInfo.options) {
    logger.infoHigh('\nStarting ...\n');
    bluebox.runModule(moduleName, moduleOptions, cb);

    return;
  }
  async.eachSeries(
    Object.keys(moduleInfo.options),
    (option, callback) => {
      let defaultValue;
      let printDefault;
      if (modulesGeneralOptions[option]) {
        defaultValue = modulesGeneralOptions[option];
      } else {
        defaultValue = moduleInfo.options[option].defaultValue;
      }

      // TODO: Move these checks outside here (if possible) to avoid
      // check in every iteration
      // Default exceptions to get a friendly interaction with the user
      // Tricking the info to shown to cover this case
      if (option === 'ports') { defaultValue = portFromTransport[chosenTransport]; }
      if (defaultValue) {
        printDefault = defaultValue;
      } else {
        printDefault = 'required';
      }
      // Avoiding to ask for not needed params
      if ((['wsPath', 'wsProto'].indexOf(option) !== -1 &&
          ['ws', 'wss'].indexOf(chosenTransport) === -1)) {
        callback();
      } else {
        readStream.question(
          `* ${option}: ${moduleInfo.options[option].description} (${printDefault}): `,
          answer => {
            let autoAnswer = null;
            if (answer !== '') {
              autoAnswer = answer.trim();
            } else if (option === 'port') {
              // Tricking the info to pass to the module to cover this case
              autoAnswer = portFromTransport[chosenTransport];
            }
            if (option === 'transport') {
              if (answer === '') {
                chosenTransport = 'udp';
              } else {
                chosenTransport = answer.toLowerCase();
              }
            }
            // The parser will stop if:
            // - the type doesn't exist
            // - param not passed & not defaultValue (required)
            moduleOptions[option] = autoAnswer;
            callback();
          }
        );
      }
    },
    err => {
      if (!err) {
        logger.infoHigh('\nStarting ...\n');
        bluebox.runModule(moduleName, moduleOptions, cb);
      }
    }
  );
}

function exitFine() {
  logger.bold('\nSee you! ;)');
  process.exit();
}

// Client commands not included as modules
const commCases = {
  // To avoid command not found on empty string
  '': readStream => { readStream.prompt(); },
  quit: () => { exitFine(); },
  // TODO ???
  // exit: () => { this.quit(); },
  exit: () => { exitFine(); },
  help: (readStream, commArrr) => {
    if (commArrr.length > 1) {
      if (modulesList.indexOf(commArrr[1]) !== -1) {
        if (commArrr[1] === 'help') {
          logger.error('Really? xD');
        } else if (modulesInfo[commArrr[1]] !== undefined) {
          logger.json(modulesInfo[commArrr[1]].help);
        } else {
          logger.error('ERROR: Help not found');
        }
      } else {
        logger.error('ERROR: Module not found');
      }
    } else {
      lodash.each(modulesList, module => {
        if (modulesInfo[module]) {
          logger.highlight(module);
          if (modulesInfo[module].help) { // TO-DO: Delete this condition?
            logger.regular(modulesInfo[module].help.description);
          }
        }
      });

      logger.infoHigh('\nYou can get more info about a module ' +
                      'using "help MODULE" (ie: "help sipScan")');
    }
    readStream.prompt();
  },
  shodanKey: readStream => {
    readStream.question(
      '* Enter your key: ',
      answer => {
        if (answer) {
          const answerTrim = answer.trim();

          bluebox.setShodanKey(answerTrim);
          logger.infoHigh('Using SHODAN key: ');
          logger.highlight(`${answerTrim}\n`);
        } else {
          logger.error('Empty key');
        }
        readStream.prompt();
      }
    );
  },
  setg: readStream => {
    autoCompType = 'variable';
    readStream.question(
      '* variable: ',
      answerVar => {
        if (answerVar) {
          if (modulesSetVars.indexOf(answerVar.trim()) !== -1) {
            autoCompType = 'value';
            readStream.question(
              '* value: ',
              answerVal => {
                modulesGeneralOptions[answerVar] = answerVal;
                logger.infoHigh('Variable stored\n');
                autoCompType = 'command';
                readStream.prompt();
              }
            );
          } else {
            autoCompType = 'command';
            logger.error(`Variable \'${answerVar}\' is undefined\n`);
            readStream.prompt();
          }
        } else {
          autoCompType = 'command';
          logger.error('Empty value\n');
          readStream.prompt();
        }
      }
    );
  },
  getg: readStream => {
    lodash.each(modulesGeneralOptions, (v, k) => {
      logger.infoHigh(`${k}: `);
      logger.info(v);
    });
    logger.info('\n');
    readStream.prompt();
  },
};


function runCommand(comm, readStream) {
  // Deleting not needed params
  const splitComm = comm.split(' ');

  if (commCases[splitComm[0]]) {
    commCases[splitComm[0]](readStream, splitComm);
  } else if (modulesList.indexOf(comm) !== -1) {
    runModule(comm, readStream);
  } else {
    shell.exec(comm, { silent: true }, (code, output) => {
      if (code === 127) {
        logger.error('ERROR: module/command not found');
      } else {
        logger.regular(output);
      }
      readStream.prompt();
    });
  }
}

function createprompt() {
  const rl = readline.createInterface(process.stdin, process.stdout, completer);

  rl.setPrompt(prompt);
  rl.prompt();

  // On new line
  rl.on('line', line => runCommand(line.trim(), rl));

  // On Ctrl+C, Ctrl+D, etc.
  rl.on('close', () => {
    if (!exitNext) {
      logger.bold('\nPress Ctrl+C again to quit.');
      exitNext = true;
      createprompt();
      // If more than 5 secs. the user will need
      // to push the keys combination twice again
      setTimeout(() => { exitNext = false; }, 5000);
    } else { exitFine(); }
  });
}


// Starting here.

// Creating the Bluebox object
bluebox = new Bluebox({});

// Generating the modules list and variables
modulesInfo = bluebox.help();

lodash.each(modulesInfo, (v, k) => {
  if (Object.keys(v).length === 0) return;
  modulesList.push(k);
  if ('options' in v.help) {
    if (v.help.options !== undefined) {
      lodash.each(v.help.options, (subv, subk) => {
        if (modulesSetVars.indexOf(subk) === -1) {
          modulesSetVars.push(subk);
        }
      });
    }
  }
});


// Adding client modules (avoiding the empty string)
modulesList = modulesList.concat(Object.keys(commCases).splice(1));

// Welcome info is printed
logger.welcome('\n\tWelcome to Bluebox-ng');
logger.info(`\t(v${bluebox.version()})\n`);

// The prompt is started
createprompt();

// Just in case ;)
process.on('uncaughtException', err => {
  logger.error('"uncaughtException" found:');
  logger.error(err);
  createprompt();
});
