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

const defaultOpts = {
  proto: 'http',
  transport: 'http', // vs https
  // TODO: Set in run time the default for each protocol (only as default if not set)
  port: 8080,
  timeout: 5000,
};


// TODO: Add to the documentation
module.exports = (ip, action, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!ip) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if ((ip && !utils.validator.isIP(ip)) ||
        (opts.proto && !utils.includes(utils.keys(protocols), opts.proto)) ||
        // ".toString()" because "validator" only works over strings.
        (opts.port && !utils.validator.isPort(opts.ports.toString())) ||
        (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString()))) {
      // TODO: Add the param which failed to the error.
      reject(new Error(errMsgs.paramBad));

      return;
    }

    dbg(`Starting, IP: "${ip}", options`, opts);
    const finalOpts = utils.defaults(opts, defaultOpts);
    dbg('Final options', finalOpts);
    let credPair = null;
    if (opts.user) { credPair = [opts.user, opts.password]; }

    protocols[finalOpts.proto].post(ip, credPair, action, finalOpts).delay(finalOpts.delay)
    .then((res) => {
      dbg('Response received');
      // Each one can return a different object, so left it as it comes.
      resolve(res);
    })
    .catch(err => reject(err));
  });
