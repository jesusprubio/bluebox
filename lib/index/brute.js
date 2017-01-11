/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';


const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');

const Promise = utils.Promise;
const protocols = utils.requireDir(module, '../utils/protocols');
const dbg = utils.dbg(__filename);

const defaultOpts = {
  protocol: 'ssh',
  // TODO: Set in run time the default for each protocol (only as default if not set)
  port: 22,
  users: ['0000', '0001', '0002'],
  passwords: ['0000', '0001', '0002'],
  userAsPass: true,
  // TODO: Keep an eye and use a secure value here.
  // TODO: Take from cfg file.
  concurrency: 100,
  delay: 0,
  timeout: 5000,
};


function filter(arr) {
  const filtered = utils.filter(arr, (entry) => {
    if (!entry) { return false; }

    return true;
  });

  return filtered;
}


module.exports = (ip, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!ip) {
      reject(new Error(errMsgs.paramReq));

      return;
    }


    if ((ip && !utils.validator.isIP(ip)) ||
        (opts.protocol && !utils.includes(utils.keys(protocols), opts.protocol)) ||
        // ".toString()" because "validator" only works over strings.
        (opts.port && !utils.validator.isPort(opts.port.toString())) ||
        // true ||
        (opts.users && !utils.isArray(opts.users)) ||
        (opts.passwords && !utils.isArray(opts.passwords)) ||
        (opts.userAsPass && !utils.validator.isBoolean(opts.userAsPass.toString())) ||
        (opts.concurrency && !utils.validator.isNumeric(opts.concurrency.toString())) ||
        (opts.delay && !utils.validator.isNumeric(opts.delay.toString())) ||
        (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString())) ||
        (opts.attempts && !utils.validator.isNumeric(opts.attempts.toString()))) {
      // TODO: Add the param which failed to the error.
      reject(new Error(errMsgs.paramBad));

      return;
    }

    dbg(`Starting, IP: ${ip}, options`, opts);

    const finalOpts = utils.defaults(opts, defaultOpts);

    dbg(`Starting bruteforce, IP: ${ip}, final options`, finalOpts);

    // Adding the usernames as passwords if required.
    let finalPasswords = finalOpts.passwords;
    if (finalOpts.userAsPass) { finalPasswords = utils.concat(finalPasswords, finalOpts.users); }

    dbg('Final options', finalOpts);
    dbg('Preparing an iterator for:', { users: finalOpts.users, passwords: finalPasswords });
    // TODO: Add a public util to get an array from a dic (each line)
    // We need an iterable to avoid a full break with huge ones (GC).
    const credPairs = new utils.ProductIterable(finalOpts.users, finalPasswords);

    const protoOpts = {
      port: finalOpts.port,
      timeout: finalOpts.timeout,
    };

    // Running a promise which resolves to an array with all the results.
    Promise.map(
      credPairs,
      // Requests (promises) generator.
      // TODO: Check without "delay" to see if it has better performance.
      credPair => protocols[finalOpts.protocol](ip, credPair, protoOpts).delay(finalOpts.delay),
      { concurrency: finalOpts.concurrency }
    )
    .then(res => resolve(filter(res)))
    .catch(err => reject(err));
  });
