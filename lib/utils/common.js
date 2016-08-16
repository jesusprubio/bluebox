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


// TODO: Get from utils.
const lodash = require('lodash');

const blueTypes = require('./types');
const errorMsgs = require('./errorMsgs').pathToName;


module.exports.pathToName = (fullPath) => {
  const res = path.basename(fullPath, '.js');

  if (!res || res === fullPath) {
    throw new Error(errorMsgs.badPath);
  } else {
    return res;
  }
};

const debug = require('./debug')(this.pathToName(__filename));


// Using the types subsystem to get the values needed by de modules.
module.exports.parseOpts = (passedOpts, expectedOpts) => {
  const finalOpts = {};

  debug('parseOpts reached:', { passedOpts, expectedOpts });

  if (lodash.isEmpty(expectedOpts)) {
    debug('This module doesn\'t need parameters');
    return finalOpts;
  }

  debug('Iterating over the options to check them ...');
  lodash.each(Object.keys(expectedOpts), option => {
    const passedValue = passedOpts[option];
    const expectedOpt = expectedOpts[option];

    debug(`key ${option}`, { passedValue, expectedOpt });

    if (!blueTypes[expectedOpt.type]) {
      throw new Error(`parseOpts : "${option}" : Type not found : ${expectedOpt.type}`);
    }

    // If not defaultValue then the option is required
    if (!passedValue && !expectedOpt.defaultValue) {
      throw new Error(`parseOpts : Required option: ${option}`);
    }

    // The default value is always used if the option is not provided
    const finalValue = passedValue || expectedOpt.defaultValue;
    debug('Parsing and checking the parameter:', {
      finalValue,
      passedValue,
      defaultValue: expectedOpt.defaultValue,
    });

    let val;
    try {
      val = blueTypes[expectedOpt.type](finalValue);
      debug(`Option parsed to: "${val}"`);

      finalOpts[option] = val;
    } catch (err) {
      throw new Error(`"${option}" : ${err.message}`);
    }
  });

  debug('All options parsed:', { finalOpts });

  return finalOpts;
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
