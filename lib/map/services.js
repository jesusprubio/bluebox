/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

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
  rports: [80],
  // TODO: Keep an eye and use a secure value here.
  // TODO: Take from cfg file.
  concurrency: 100,
  delay: 0,
  timeout: 5000,
};


module.exports = (rhosts, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!rhosts) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if ((opts.proto && !utils.includes(utils.keys(protocols), opts.proto)) ||
        // ".toString()" because "validator" only works over strings.
        (opts.rports && (!utils.isArray(opts.rports) ||
        (opts.rports[0] && !utils.validator.isPort(opts.rports[0].toString())))) ||
        (opts.concurrency && !utils.validator.isNumeric(opts.concurrency.toString())) ||
        (opts.delay && !utils.validator.isNumeric(opts.delay.toString())) ||
        (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString()))) {
      // TODO: Add the param which failed to the error.
      reject(new Error(errMsgs.paramBad));

      return;
    }

    dbg(`Starting, rhosts: "${rhosts}", options`, opts);
    const finalOpts = utils.defaults(opts, defaultOpts);
    dbg('Final options', finalOpts);

    dbg('Preparing an iterator for:', { rhosts: finalOpts.rhosts, rports: finalOpts.rports });
    const hostPairs = new utils.ProductIterable(finalOpts.rhosts, finalOpts.rports);
    const ups = [];

    // Running a promise which resolves to an array with all the results.
    Promise.map(
      hostPairs,
      // Requests (promises) generator.
      (hostPair) => { // eslint-disable-line arrow-body-style
        return new Promise((resolveM) => {
          dbg('Starting for', { hostPair });
          // To avoid to modify the original
          const optsCopy = utils.clone(finalOpts);
          optsCopy.rport = hostPair[1];

          // TODO: Do not print here! Do it in the client.
          const toPrint = `${hostPair[0]}:${hostPair[1]}`;
          protocols[finalOpts.proto].map(hostPair[0], optsCopy).delay(finalOpts.delay)
          .then((res) => {
            dbg('Response received', { hostPair });
            // TODO: Do not print here! Do it in the client.
            // But we need to emit an event from here before.
            logger.highlight(`${toPrint} -> up`);

            if (res.up) { ups.push({ ip: hostPair[0], port: hostPair[1], data: res.data }); }
            resolveM();
          })
          // Here we don't want to stop the full chain on errors (ie: ECONNREFUSED)
          .catch(() => {
            // TODO: Do not print here! Do it in the client.
            logger.info(`${toPrint} -> down`);
            resolveM();
          });
        });
      },
      { concurrency: finalOpts.concurrency }
    )
    .then(() => resolve(ups))
    .catch(err => reject(err));
  });
