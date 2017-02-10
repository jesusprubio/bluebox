/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const errMsgs = require('../utils/errorMsgs');
const utils = require('../utils');

const Promise = utils.Promise;
const ping = require('ping');


module.exports = (rhosts, opts = {}) => {
  if (!rhosts) { return Promise.reject(new Error(errMsgs.paramReq)); }

  if (!utils.isArray(rhosts) ||
    // TODO: Not working
    // utils.every(rhosts, utils.validator.isIP) ||
    // utils.every(rhosts, ip => utils.validator.isIP(ip)) ||
    // TODO: parameter not working, see below.
    //  (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString())) ||
     (opts.attempts && !utils.validator.isNumeric(opts.attempts.toString()))) {
    return Promise.reject(new Error(errMsgs.paramBad));
  }

  return Promise.map(
    rhosts,
    (rhost) => {
      const attempts = opts.attempts || 3;
      const reqCfg = {
        // TODO: Not working for values over > 2000
        // timeout: opts.timeout || 5000,
        extra: [`-i ${attempts.toString()}`],
      };

      return ping.promise.probe(rhost, reqCfg);
    },
    // TODO: Review
    { concurrency: 10 }
  );
};
