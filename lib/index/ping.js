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


module.exports = (ips, opts = {}) => {
  if (!ips) { return Promise.reject(new Error(errMsgs.paramReq)); }

  if (!utils.isArray(ips) ||
    // TODO: Not working
    // utils.every(ips, utils.validator.isIP) ||
    // utils.every(ips, ip => utils.validator.isIP(ip)) ||
    // TODO: parameter not working, see below.
    //  (opts.timeout && !utils.validator.isNumeric(opts.timeout.toString())) ||
     (opts.attempts && !utils.validator.isNumeric(opts.attempts.toString()))) {
    return Promise.reject(new Error(errMsgs.paramBad));
  }

  return Promise.map(
    ips,
    (ip) => {
      const attempts = opts.attempts || 3;
      const reqCfg = {
        // TODO: Not working for values over > 2000
        // timeout: opts.timeout || 5000,
        extra: [`-i ${attempts.toString()}`],
      };

      return ping.promise.probe(ip, reqCfg);
    },
    // TODO: Review
    { concurrency: 10 }
  );
};
