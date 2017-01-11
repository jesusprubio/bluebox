/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

// Helper for the file "index.js" (entry point).

const blueTypes = require('./types');
const utils = require('./');
const errMsgs = require('./errorMsgs').parseOpts;

const dbg = utils.dbg(__filename);


// Using the types subsystem to get the values needed by de modules.
module.exports = (passedOpts, expectedOpts) => {
  const finalOpts = {};

  dbg('parseOpts reached', { passedOpts, expectedOpts });

  if (utils.isEmpty(expectedOpts)) {
    dbg('This module doesn\'t need parameters');
    return finalOpts;
  }

  dbg('Iterating over the options to check them ...');
  utils.each(Object.keys(expectedOpts), (option) => {
    const passedValue = passedOpts[option];
    const expectedOpt = expectedOpts[option];

    dbg(`key ${option}`, { passedValue, expectedOpt });

    if (!blueTypes[expectedOpt.type]) {
      throw new Error(`"${option}" : ${errMsgs.notFound} : ${expectedOpt.type}`);
    }

    // If not defaultValue then the option is required
    if (!passedValue && !expectedOpt.defaultValue) {
      throw new Error(`"${option}" : ${errMsgs.required}`);
    }

    // The default value is always used if the option is not provided
    const finalValue = passedValue || expectedOpt.defaultValue;
    dbg('Parsing and checking the parameter:', {
      finalValue,
      passedValue,
      defaultValue: expectedOpt.defaultValue,
    });

    let val;
    try {
      val = blueTypes[expectedOpt.type](finalValue);
      dbg(`Option parsed to: "${val}"`);

      finalOpts[option] = val;
    } catch (err) {
      throw new Error(`"${option}" : ${err.message}`);
    }
  });

  dbg('All options parsed', { finalOpts });

  return finalOpts;
};
