#!/usr/bin/env node

// Copyright Jesus Perez <jesusprubio gmail com>
//           Antonio Carrasco <ancahy2600 gmail com>
//
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

const vorpal = require('vorpal')();

const cfg = require('./cfg');
const Bluebox = require('../');
const logger = require('../lib/utils/logger');
const utils = require('../lib/utils/utils');

const debug = utils.debug(utils.pathToName(__filename));


debug('Starting ...');
const bluebox = new Bluebox({});
debug('Getting all Bluebox modules details ...');
const modulesInfo = bluebox.help();
debug('Modules details', modulesInfo);

utils.debug('Defining the commands for the Bluebox modules ...');
utils.each(utils.keys(modulesInfo), moduleName => {
  vorpal
    .command(moduleName)
    .description(modulesInfo[moduleName].description)
    .action(() =>
      new Promise(resolve => {
        const expectedOpts = modulesInfo[moduleName].options;
        const parsedOpts = [];

        // Massaging the data to make Vorpal happy.
        utils.each(utils.keys(expectedOpts), name => {
          let message = `* ${name}: ${expectedOpts[name].description}`;

          if (expectedOpts[name].defaultValue) {
            message += ` (${expectedOpts[name].defaultValue})`;
          }

          parsedOpts.push({
            type: 'input',
            name,
            message,
          });
        });

        // We need to use "activeCommand" because of a Vorpal limitation
        // with ES6: https://github.com/dthree/vorpal/issues/14
        vorpal.activeCommand.prompt(parsedOpts)
        .then(answers => {
          bluebox.run(moduleName, answers)
          .then(res => {
            logger.bold('\nRESULT:\n');
            if (!res) {
              logger.result('No result');
            } else {
              logger.json(res);
            }
            logger.regular('\n');
            resolve();
          })
          .catch(err => {
            // We always resolve (instead reject) because we don't
            // want to stop the full program.
            logger.error(`Running the module : ${err.message}`);
            resolve();
          });
        })
        .catch(err => {
          logger.error(`Getting the options : ${err.message}`);
          resolve();
        });
      })
    );
});

logger.welcome('\n\tWelcome to Bluebox-ng');
logger.info(`\t(v${bluebox.version()})\n`);


debug('Starting the prompt ...');
vorpal
  // Persistent command history.
  .history('bluebox-ng')
  // Prompt content.
  .delimiter(cfg.prompt)
  // Starting the prompt.
  .show();


// Just in case ;).
// TODO: Needed with vorpal?
// process.on('uncaughtException', err => {
//   logger.error('"uncaughtException" found:');
//   logger.error(err);
//   createprompt();
// });
