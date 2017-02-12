/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';


const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');

const Promise = utils.Promise;
const protocols = utils.requireDir(module, '../protocols');
const dbg = utils.dbg(__filename);
const logger = require('../../bin/lib/logger');

const defaultOpts = {
  proto: 'http',
  // TODO: Set in run time the default for each protocol (only as default if not set)
  rport: 8080,
  users: ['0000', '0001', '0002'],
  passwords: ['0000', '0001', '0002'],
  userAsPass: true,
  // TODO: Keep an eye and use a secure value here.
  // TODO: Take from cfg file.
  concurrency: 100,
  delay: 0,
  timeout: 5000,
};


module.exports = (rhost, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!rhost) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    dbg(`Starting, IP: ${rhost}, options`, opts);

    if ((rhost && !utils.validator.isIP(rhost)) ||
        (opts.proto && !utils.includes(utils.keys(protocols), opts.proto)) ||
        // ".toString()" because "validator" only works over strings.
        (opts.rport && !utils.validator.isPort(opts.rport.toString())) ||
        (opts.users && !utils.isArray(opts.users)) ||
        (opts.passwords && !utils.isArray(opts.passwords)) ||
        (opts.userAsPass && !utils.validator.isBoolean(opts.userAsPass.toString())) ||
        (opts.concurrency && !utils.validator.isNumeric(opts.concurrency.toString())) ||
        (opts.delay && !utils.validator.isNumeric(opts.delay.toString())) ||
        (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString()))) {
      // TODO: Add the param which failed to the error.
      reject(new Error(errMsgs.paramBad));

      return;
    }

    dbg('Check passed');
    const finalOpts = utils.defaults(opts, defaultOpts);
    dbg('Final options', finalOpts);

    // Adding the usernames as passwords if required.
    // The "[]" for protos with only one variable (ie: TFTP).
    let finalPasswords = finalOpts.passwords || [];
    if (finalOpts.userAsPass) { finalPasswords = utils.concat(finalPasswords, finalOpts.users); }

    dbg('Final options', finalOpts);
    dbg('Preparing an iterator for:', { users: finalOpts.users, passwords: finalPasswords });
    // TODO: Add a public util to get an array from a dic (each line)
    // We need an iterable to avoid a full break with huge ones (GC).
    const credPairs = new utils.ProductIterable(finalOpts.users, finalPasswords);

    const valids = [];
    // Running a promise which resolves to an array with all the results.
    Promise.map(
      credPairs,
      // Requests (promises) generator.
      // TODO: Check without "delay" to see if it has better performance.
      (credPair) => { // eslint-disable-line arrow-body-style
        return new Promise((resolveM, rejectM) => {
          dbg('Starting for', { credPair });

          const toPrint = `${credPair[0]} / ${credPair[1]}`;
          protocols[finalOpts.proto].brute(rhost, credPair, finalOpts).delay(finalOpts.delay)
          .then((res) => {
            dbg('Response received', { credPair });
            // TODO: Do not print here! Do it in the client.
            // But we need to emit an event from here before.
            logger.highlight(`${toPrint} -> ok`);

            if (res.authed) {
              let trimmed = credPair;
              // To avoid return thinks like ['filename', null] (ie: TFTP brute)
              if (!credPair[1]) { trimmed = credPair[0]; }

              valids.push(trimmed);
            } else {
              logger.info(`${toPrint} -> not ok`);
            }
            resolveM();
          })
          .catch(err => rejectM(err));
        });
      }
      ,
      { concurrency: finalOpts.concurrency }
    )
    .then(() => resolve(valids))
    .catch(err => reject(err));
  });
