/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

// Helper for the file "index.js" (entry point).

const parsers = require('./parsers');
const utils = require('./utils');
const errMsgs = require('../cfg/errorMsgs').parseOpts;

const dbg = utils.dbg(__filename);


// Using the types subsystem to get the values needed by de modules.
module.exports = (passedOpts, expectedOpts) => {
  const optsC = {};

  dbg('parseOpts reached', { passedOpts, expectedOpts });

  if (utils.isEmpty(expectedOpts)) {
    dbg('This module doesn\'t need parameters');
    return optsC;
  }

  dbg('Iterating over the options to check them ...');
  utils.each(Object.keys(expectedOpts), (option) => {
    const passedValue = passedOpts[option];
    const expectedOpt = expectedOpts[option];

    dbg(`key ${option}`, { passedValue, expectedOpt });

    // If not default value then the option is required
    // "undefined" only to let the rest of falsys to pass.
    if (!passedValue && expectedOpt.default === undefined) {
      throw new Error(`"${option}" : ${errMsgs.required}`);
    }

    // The default value is always used if the option is not provided
    const finalValue = passedValue || expectedOpt.default;

    dbg('Parsing and checking the parameter:', {
      finalValue,
      passedValue,
      default: expectedOpt.default,
    });

    if (!expectedOpt.types) {
      dbg('Type not used, passing it as it comes ...');
      optsC[option] = finalValue;

      return;
    }

    let expTypes = expectedOpt.types;
    if (utils.isArray(expTypes)) {
      if (utils.isArray(expTypes) && expTypes.lenght > 2) {
        throw new Error(`"${option}" : Two types as max`);
      }
    } else {
      dbg('Single type detected');
      expTypes = [expectedOpt.types];
    }

    dbg('Final expected types', expTypes);
    let val;
    try {
      val = parsers[expTypes[0]](finalValue);
      dbg(`Option parsed (1st try) to: "${val}"`);

      optsC[option] = val;
    } catch (err) {
      if (!expTypes[1]) { throw new Error(`"${option}" : ${err.message}`); }
      try {
        val = parsers[expTypes[1]](finalValue);
        dbg(`Option parsed (2nd try) to: "${val}"`);

        optsC[option] = val;
      } catch (err2) { throw new Error(`"${option}" : ${err2.message}`); }
    }
  });

  dbg('All options parsed', { optsC });

  return optsC;
};
