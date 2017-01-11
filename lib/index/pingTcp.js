/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const errMsgs = require('../utils/errorMsgs');
const utils = require('../utils');

const Promise = utils.Promise;
const tcpp = Promise.promisify(require('tcp-ping').ping);


// To remove not needed info (consistency).
function massage(obj) {
  const finalRes = obj;

  // We keep the optionals because the user maybe didn't pass them.
  delete finalRes.address;

  return finalRes;
}


module.exports = (ip, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!ip) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if ((ip && !utils.validator.isIP(ip)) ||
        // ".toString()" because "validator" only works over strings.
        (opts.port && !utils.validator.isPort(opts.port.toString())) ||
        (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString())) ||
        (opts.attempts && !utils.validator.isNumeric(opts.attempts.toString()))) {
      // TODO: Add the param which failed to the error.
      reject(new Error(errMsgs.paramBad));

      return;
    }

    const reqCfg = {
      address: ip,
      port: opts.port || 80,
      timeout: opts.timeout || 5000,
      attempts: opts.attempts || 3,
    };

    tcpp(reqCfg)
    .then(res => resolve(massage(res)));
    // TODO: To catch error needed?
  });
