#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>
            Antonio Carrasco <ancahy2600 gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const vorpal = require('vorpal')();

const cfg = require('./cfg');
const BlueboxCli = require('../').Cli;
const logger = require('./lib/utils/logger');
const utils = require('./lib/utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);

// Global paramameters to avoid the user having to rewrite them
// in each module run. They are proposed as the default value.
// They name should be equal to the one to module expected option
// which should rewrite.
const globalParams = {};


dbg('Starting ...');
const cli = new BlueboxCli({});
dbg('Getting all Bluebox modules details ...');
const modulesInfo = cli.help();
dbg('Modules details', modulesInfo);

dbg('Defining the commands for the Bluebox modules ...');
utils.each(utils.keys(modulesInfo), (moduleName) => {
  // We need this to do a trick to include the global parameters.
  // The Bluebox library manages the module parameters default values
  // for us. But we need this trick to allow the global parameters.
  const defaults = {};

  vorpal
    .command(moduleName)
    .description(modulesInfo[moduleName].description)
    .action(() =>
      new Promise((resolve) => {
        const expectedOpts = modulesInfo[moduleName].options;
        const parsedOpts = [];

        // Massaging the data to make Vorpal happy.
        utils.each(utils.keys(expectedOpts), (name) => {
          let message = `* ${name}: ${expectedOpts[name].description}`;
          let finalDefault = null;

          if (globalParams[name]) {
            finalDefault = globalParams[name];
          } else if (expectedOpts[name].defaultValue) {
            finalDefault = expectedOpts[name].defaultValue;
          }
          if (finalDefault) {
            defaults[name] = finalDefault;
            message += ` (${finalDefault})`;
          }
          message += ': ';

          parsedOpts.push({
            type: 'input',
            name,
            message,
          });
        });

        // We need to use "activeCommand" because of a Vorpal limitation
        // with ES6: https://github.com/dthree/vorpal/issues/14
        vorpal.activeCommand.prompt(parsedOpts)
        .then((answers) => {
          const finalAnswers = [];

          utils.each(utils.keys(answers), (key) => {
            if (answers[key] === '') {
              finalAnswers[key] = defaults[key];
            } else {
              finalAnswers[key] = answers[key];
            }
          });

          cli.run(moduleName, finalAnswers)
          .then((res) => {
            logger.bold('\nRESULT:\n');
            if (!res) {
              logger.result('No result');
            } else {
              logger.json(res);
            }
            logger.regular('\n');
            resolve();
          })
          .catch((err) => {
            // We always resolve (instead reject) because we don't
            // want to print the error with vorpal (doesn't allow colors).
            logger.error(`Running the module : ${err.message}`);
            resolve();
          });
        })
        .catch((err) => {
          logger.error(`Getting the options : ${err.message}`);
          // console.log('1111111111111111');
          resolve();
        });
      }));
});

// Client specific commands.
vorpal
  .command('shodanSetKey')
  .description('To add you SHODAN API key')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'key',
          message: 'Your key: ',
        },
      ])
      .then((answers) => {
        if (answers.key) {
          cli.setShodanKey(answers.key);
        } else {
          logger.error('Empty key');
        }
        resolve();
      })
      .catch((err) => {
        logger.error(`Getting the key : ${err.message}`);
        resolve();
      });
    }));


vorpal
  .command('globalList')
  .description('To get the values of all global parameters')
  .action(() => {
    logger.json(globalParams);

    return Promise.resolve();
  });


vorpal
  .command('globalGet')
  .description('To get the value of a global parameter')
  .action(() =>
    new Promise((resolve) => {
      vorpal.activeCommand.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Name of the param: ',
        },
      ])
      .then((answers) => {
        if (answers.name) {
          if (globalParams[answers.name]) {
            logger.result(globalParams[answers.name]);
          } else {
            logger.error('Global parameter not found');
          }
        } else {
          logger.error('Empty name');
        }

        resolve();
      })
      .catch((err) => {
        logger.error(`Getting the key : ${err.message}`);
        resolve();
      });
    }));


vorpal
  .command('globalSet')
  .description('To add a global parameter to use through all the modules')
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
          globalParams[answers.name] = answers.value;
          logger.json(answers);
        }

        resolve();
      })
      .catch((err) => {
        logger.error(`Getting the key : ${err.message}`);
        resolve();
      });
    }));


logger.welcome('\n\tWelcome to Bluebox-ng');
logger.info(`\t(v${cli.version})\n`);

dbg('Starting the prompt ...');
vorpal
  // Persistent command history.
  .history('bluebox-ng')
  // Prompt content.
  .delimiter(cfg.prompt)
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
