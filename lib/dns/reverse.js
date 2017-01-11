/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const dns = require('dns');

const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');

const reverse = utils.Promise.promisify(dns.reverse);


module.exports = (ip) => {
  if (!ip) { return Promise.reject(new Error(errMsgs.paramReq)); }

  if (!utils.validator.isIP(ip)) {
    return Promise.reject(new Error(errMsgs.paramBad));
  }

  return reverse(ip);
};
