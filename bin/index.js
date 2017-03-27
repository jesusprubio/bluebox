#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>
            Antonio Carrasco <ancahy2600@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const vorpal = require('vorpal')();
const vHn = require('vorpal-hacker-news');
const vLess = require('vorpal-less');
const vGrep = require('vorpal-grep');

const logger = require('./utils/logger');

logger.infoHigh(`${logger.emoji('rocket')}  Loading modules ...`);

const cfg = require('./cfg');
const Bluebox = require('..');
const utils = require('../lib/utils');


const dbg = utils.dbg(__filename);
// Global paramameters to avoid the user having to rewrite them
// in each module run. They are proposed as the default value.
// They name should be equal to the one to module expected option
// which should rewrite.
const globals = {};


dbg('Starting ...');

const cli = new Bluebox({});
dbg('Getting all Bluebox modules details ...');
const modulesInfo = cli.modules;
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
        logger.subtitle(`\n${modulesInfo[moduleName].desc}\n`);


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
          cli.run(moduleName, answers)
          .then((res) => {
            logger.infoHigh(`\n${logger.emoji('airplane_arriving')}  Module run finished`);
            logger.timeEnd('time');
            logger.title(`\n${logger.emoji('sparkles')}  Result`);
            if (!res || (utils.isArray(res) && res.length === 0) ||
                (utils.isObject(res) && Object.keys(res).lenght === 0)) {
              logger.result(`${logger.emoji('poop')}  Empty`);
            } else {
              logger.json(res);
            }
            logger.regular('\n');
            resolve();
          })
          .catch((err) => {
            logger.timeEnd('time');
            // We always resolve (instead reject) because we don't
            // want to print the error with vorpal (doesn't allow colors).
            logger.error('\nRunning the module', err);
            logger.info(err.stack);
            resolve();
          });
        })
        .catch((err) => {
          logger.error('Getting the options', err);
          resolve();
        });
      }));
});


// We overwrite the built-in exit command to print a bye message, save the session (if needed), etc.
const exit = vorpal.find('exit');
if (exit) { exit.remove(); }
vorpal
  .command('exit')
  .alias('quit')
  .description('Quit the app.')
  .action(() => {
    logger.subtitle(`\n${logger.emoji('wave')}  See you!\n`);
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
  .command('misc/dicNames')
  .description('Get built-in dictionaries names to use in another modules.')
  .action(() => {
    logger.json(cli.dics);

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


logger.infoHigh(`${logger.emoji('computer')}  Starting the framework in interactive mode ...\n`);
logger.title(`\n\tBluebox-ng ${logger.emoji('phone')}  ${logger.emoji('skull')}`);
logger.info(`\t(v${cli.version})`);
logger.subtitle(`\n${logger.emoji('eyes')}  Please run "help" or ` +
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
