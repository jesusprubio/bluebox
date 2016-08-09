/*
Copyright   Jesus Perez <jesusprubio gmail com>
            Aan Wahyu <cacaddv gmail com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

'use strict';

const path = require('path');

const async = require('async');
const request = require('request');
const localIp = require('local-ip');
const lodash = require('lodash');

const blueTypes = require('./types');


// Using the types subsystem to get the values needed by de modules
module.exports.parseOpts = (passedOpts, expectedOpts, callback) => {
  const finalOpts = {};

  // Module which doesn't need parameters
  if (!expectedOpts) {
    callback(null, null);

    return;
  }

  async.eachSeries(
      Object.keys(expectedOpts),
      (option, cbSeries) => {
        const passedValue = passedOpts[option];
        const expectedOpt = expectedOpts[option];

        if (!blueTypes[expectedOpt.type]) {
          cbSeries({
            message: `Type not found: ${expectedOpt.type}`,
            error: null,
          });

          return;
        }
        // If not defaultValue then the option is required
        if (!passedValue && !expectedOpt.defaultValue) {
          cbSeries({
            message: `Required option: ${option}`,
            error: null,
          });

          return;
        }

        // The default value is always used if the option is not provided
        const finalValue = passedValue || expectedOpt.defaultValue;

        // Async params
        if (option === 'srcHost') {
          if (finalValue.slice(0, 6) === 'iface:') {
            localIp(finalValue.slice(6), (err, res) => {
              if (err) {
                cbSeries({
                  message: `Bad param: "${option}"`,
                  error: err.toString(),
                });

                return;
              }

              finalOpts[option] = res;
              cbSeries();
            });
          } else if (finalValue === 'external') {
            // TODO: Use the same lib than in the module
            request.get({
              uri: 'http://icanhazip.com/',
              timeout: 5000,
              json: false,
            }, (err, r, body) => {
              if (err) {
                cbSeries({
                  message: `Bad param: "${option}"`,
                  error: err.toString(),
                });

                return;
              }

              // Removing the ending '\n'
              finalOpts[option] = body.substr(0, body.length - 1);
              cbSeries();
            });
          } else if (finalValue === 'random') {
            // The parser ("types.js") will complete it
            finalOpts[option] = null;
            cbSeries();
          }
        } else {
          // Trying to get the final value for this parameter
          try {
            finalOpts[option] = blueTypes[expectedOpt.type](finalValue);
          } catch (err) {
            cbSeries({
              message: `Bad parameter: ${option}`,
              error: err.toString(),
            });
          }

          // All fine, go to the next iteration
          cbSeries();
        }
      },
      err => {
        if (err) {
          callback(err);
        } else {
          callback(null, finalOpts);
        }
      }
  );
};

// Needed by the "autoVoip" module
module.exports.createAutoTargets = (ips, customServices, sipTypes) => {
  const targets = [];

  // Getting all combinations
  lodash.each(ips, target => {
    lodash.each(customServices, sipService => {
      // All requeqs which the server could answer at
      lodash.each(sipTypes, meth => {
        if (sipService.transport === 'WS' || sipService.transport === 'WSS') {
          lodash.each(['', 'ws'], wsPath => {
            targets.push({
              ip: target,
              port: sipService.port,
              transport: sipService.transport,
              meth,
              wsPath,
            });
          });
        } else {
          targets.push({
            ip: target,
            port: sipService.port,
            transport: sipService.transport,
            meth,
          });
        }
      });
    });
  });

  return targets;
};


module.exports.pathToName = (fullPath) => path.basename(fullPath, '.js');
