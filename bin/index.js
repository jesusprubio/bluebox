#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>
            Antonio Carrasco <ancahy2600@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

// Framework environment.

'use strict';

// const util = require('util');
const path = require('path');
const moment = require('moment');
const vorpal = require('vorpal')();
const vHn = require('vorpal-hacker-news');
const vLess = require('vorpal-less');
const vGrep = require('vorpal-grep');
const hbs = require('handlebars');

const Bluebox = require('..');
const logger = require('./utils/logger');
const cfg = require('./cfg');
const utils = require('../lib/utils');
const auto = require('./auto');


const bBox = new Bluebox();
const dbg = utils.dbg(__filename);
// Global paramameters to avoid the user having to rewrite them
// in each module run. They are proposed as the default value.
// They name should be equal to the one to module expected option
// which should rewrite.
const globals = {};
const templatePath = '../artifacts/reportTemplates/default.hbs';


// TODO: Keep this during the run of the actual command. In case
// it fails we could save these partial results.
let lastValid = false;
bBox.events.on('info', (info) => {
  dbg('Event with extra info');

  let toPrint = info.pair[0];
  // In some cases we don't have second member.
  if (info.pair[1]) { toPrint = `${toPrint} : ${info.pair[1]}`; }

  if (!lastValid) { logger.moveUp(); }

  if (info.valid) {
    lastValid = true;
    logger.result(`${toPrint} ${logger.emoji('ok_hand')}`);
  } else {
    lastValid = false;
    logger.info(toPrint);
  }
});


dbg('Getting all modules details ...');
const modulesInfo = bBox.modules;
dbg('Modules details', modulesInfo);

dbg('Defining the commands for the Bluebox modules ...');
utils.each(utils.keys(modulesInfo), (moduleName) => {
  dbg(`Starting for ${moduleName}`);

  vorpal
    .command(moduleName)
    .description(modulesInfo[moduleName].desc)
    .action(() =>
      new Promise((resolve) => {
        const expectedOpts = modulesInfo[moduleName].opts;
        const parsedOpts = [];

        dbg('Expected options:', { moduleName, expectedOpts });
        logger.bold(`\n${modulesInfo[moduleName].desc}\n`);

        // Massaging the data to make Vorpal happy.
        utils.each(utils.keys(expectedOpts), (name) => {
          const expectedOpt = expectedOpts[name];
          const message = `* ${name}: ${expectedOpt.desc} `;
          let finalDefault = null;

          // We need this to have into account the global parameters.
          if (globals[name]) {
            finalDefault = globals[name];
          } else if (expectedOpt.default !== undefined) {
            finalDefault = expectedOpt.default;
          }

          const toPush = {
            type: 'input',
            name,
            message,
            // TODO: Add choices support.
            when: (res) => {
              if (expectedOpt.when && utils.isObject(expectedOpt.when)) {
                const toLook = Object.keys(expectedOpt.when)[0];
                let valids;

                // We allow to pass an array or a single value here.
                if (!utils.isArray(expectedOpt.when[toLook])) {
                  valids = [expectedOpt.when[toLook]];
                } else {
                  valids = expectedOpt.when[toLook];
                }
                // Just in case.
                valids = utils.map(valids, valid => valid.toLowerCase());

                if (!utils.includes(valids, res[toLook].toLowerCase())) { return false; }
              }

              return true;
            },
          };
          // We need to accept falsys here (like "0" or "false")
          if (finalDefault !== null) { toPush.default = finalDefault; }

          parsedOpts.push(toPush);
        });

        dbg('Parsed options:', parsedOpts);

        // We need to use "activeCommand" because of a Vorpal limitation
        // with ES6: https://github.com/dthree/vorpal/issues/14
        vorpal.activeCommand.prompt(parsedOpts)
        .then((answers) => {
          logger.infoHigh(`\n${logger.emoji('beer')}  Running the module ...\n`);

          logger.time('time');
          bBox.run(moduleName, answers)
          .then((res) => {
            logger.infoHigh(`\n${logger.emoji('airplane_arriving')}  Module run finished`);
            logger.timeEnd('time');
            logger.title(`\n${logger.emoji('sparkles')}  Result`);
            if (!res || (utils.isArray(res) && utils.isEmpty(res)) ||
                (utils.isObject(res) && utils.isEmpty(Object.keys(res)))) {
              logger.result(`${logger.emoji('poop')}  Empty\n`);

              resolve();
              return;
            }

            if (!utils.isArray(res) || !utils.includes(cfg.toChunk, moduleName)) {
              logger.json(res);
              logger.regular('\n');
              resolve();
            } else {
              logger.chunks(res, 1, resolve);
            }
          })
          .catch((err) => {
            logger.timeEnd('time');
            // We always resolve (instead reject) because we don't
            // want to print the error with vorpal (doesn't allow colors).
            logger.error('\nRunning the module', err);
            resolve();
          });
        })
        .catch((err) => {
          logger.error('Getting the options', err);
          resolve();
        });
      }));
});


vorpal
  .command('hosts')
  .alias('hosts/show')
  .description('Show the info for host(s) in the actual session.')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'id',
          message: 'Identifier of the host (empty for all): ',
        },
      ])
      .then((answers) => {
        let toPrint;

        if (answers.id) {
          toPrint = bBox.hosts[answers.id];
        } else {
          toPrint = bBox.hosts;
        }

        logger.json(toPrint);
        resolve();
      })
      .catch((err) => {
        logger.error('Getting the id', err);
        resolve();
      });
    }));


vorpal
  .command('hosts/import')
  .description('Import a session from a file.')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Path of the file: ',
          default: path.resolve(process.cwd(), './report.json'),
        },
      ])
      .then((answers) => {
        if (!answers.path) {
          logger.error('A path is mandatory');
          resolve();
          return;
        }

        utils.readFile(
          // We expect a relative path.
          path.resolve(process.cwd(), answers.path),
          { encoding: 'utf8' }
        )
        .then((content) => {
          try {
            // TODO: Add a mark in the file and check here that is
            // a JSON generated by BluebBox.
            bBox.hosts = JSON.parse(content);
          } catch (err) {
            logger.error('Parsing the file', err);
            resolve();
          }

          logger.regular('File correctly imported');

          resolve();
        })
        .catch((err) => {
          logger.error('Reading the file', err);
          resolve();
        });
      })
      .catch((err) => {
        logger.error('Getting the path', err);
        resolve();
      });
    }));


// TODO: Code almost equal to the last command -> refactor.
vorpal
  .command('hosts/export')
  .description('Export a session to a file.')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Path of the file: ',
          default: path.resolve(process.cwd(), './report.json'),
        },
      ])
      .then((answers) => {
        if (!answers.path) {
          logger.error('A path is mandatory');
          resolve();
          return;
        }

        utils.writeFile(
          path.resolve(process.cwd(), answers.path),
          JSON.stringify(bBox.hosts)
        )
        .then(() => {
          logger.regular('File correctly exported');
          resolve();
        })
        .catch((err) => {
          logger.error('Writing the file', err);
          resolve();
        });
      })
      .catch((err) => {
        logger.error('Getting the path', err);
        resolve();
      });
    }));


vorpal
  .command('hosts/report')
  .description('Export the session in HTML format.')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Path of the file to write: ',
          default: path.resolve(process.cwd(), './report.html'),
        },
      ])
      .then((answers) => {
        if (!answers.path) {
          logger.error('A path is mandatory');
          resolve();
          return;
        }

        utils.readFile(
          path.resolve(__dirname, templatePath),
          { encoding: 'utf8' }
        )
        .then((templateFile) => {
          dbg('Template file correctly readed, creating the final template ...');

          const template = hbs.compile(templateFile);
          const reportHtml = template({
            report: JSON.stringify(bBox.hosts),
            date: moment().format('MMMM Do YYYY, h:mm:ss a'),
            version: bBox.version,
          });
          utils.writeFile(
            path.resolve(process.cwd(), answers.path),
            reportHtml
          )
          .then(() => {
            logger.regular('File correctly exported');
            resolve();
          })
          .catch((err) => {
            logger.error('Writing the report to a file', err);
            resolve();
          });
        })
        .catch((err) => {
          logger.error('Reading the template file', err);
          resolve();
        });
      })
      .catch((err) => {
        logger.error('Getting the path', err);
        resolve();
      });
    }));


// We overwrite the built-in exit command to print a bye message, save the session (if needed), etc.
const exit = vorpal.find('exit');
if (exit) { exit.remove(); }
vorpal
  .command('exit')
  .alias('quit')
  .description('Quit the app.')
  .action(() => {
    logger.bold(`\n${logger.emoji('wave')}  See you!\n`);
    process.exit(0);
  });


vorpal
  .command('env')
  .description('To get the values of all global parameters.')
  .action(() => {
    logger.json(globals);

    return Promise.resolve();
  });


vorpal
  .command('clear')
  .description('Clean the screen.')
  .action(() => {
    logger.clear();

    return Promise.resolve();
  });


vorpal
  .command('misc/dicNames')
  .description('Get built-in dictionaries names to use in another modules.')
  .action(() => {
    logger.json(bBox.dics);

    return Promise.resolve();
  });


vorpal
  .command('set')
  .description('To add a global parameter to use through all the modules.')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Name of the param: ',
        },
        {
          type: 'input',
          name: 'value',
          message: 'New value to set: ',
        },
      ])
      .then((answers) => {
        if (!answers.name) {
          logger.error('Empty name');
        } else if (!answers.value) {
          logger.error('Empty value');
        } else {
          globals[answers.name] = answers.value;
          logger.json(answers);
        }

        resolve();
      })
      .catch((err) => {
        logger.error('Getting the key', err);
        resolve();
      });
    }));


vorpal
  .command('auto')
  .description('Auto VoIP vulnerability scanner.')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'rhosts',
          message: 'Host to inspect (IP), range (ie: "192.168.0.1-256") ' +
                    'of a file with them (file:./whatever/galicianIps.txt)',
          default: '192.168.0.0/24',
        },
        {
          type: 'input',
          name: 'profile',
          message: 'Type of scanning ("quick", "regular", "slow") or custom ' +
                   '(pass a file path here in this case)',
          default: 'regular',
        },
      ])
      .then(answers => auto(bBox, answers.rhosts, answers.profile, resolve))
      .catch((err) => {
        logger.error('Parsing the options (auto)', err);
        resolve();
      });
    }));


logger.title(`\n\tBluebox-ng ${logger.emoji('phone')}`);
logger.info(`\t(v${bBox.version})`);
logger.bold(`\n${logger.emoji('eyes')}  Please run "help" or ` +
                '"help | grep sip" to start the game\n');

dbg('Starting the prompt ...');
vorpal
  // Persistent command history.
  .history('bluebox-ng')
  // Prompt content.
  .delimiter(cfg.prompt)
  .use(vHn)
  .use(vLess)
  .use(vGrep)
  // Starting the prompt.
  .show();


// Just in case we lost something, to avoid a full break.
process.on('uncaughtException', (err) => {
  logger.error('"uncaughtException" found:');
  logger.error(err);

  // Restarting the prompt to let the user continue without a restart.
  vorpal.show();
});

process.on('unhandledRejection', (reason) => {
  logger.error(`"unhandledRejection : reason : ${reason}`);

  vorpal.show();
});

