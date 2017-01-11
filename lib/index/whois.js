/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const errMsgs = require('../utils/errorMsgs');
const utils = require('../utils');

const Promise = utils.Promise;
const lookup = Promise.promisify(require('whois').lookup);


module.exports = (target) => {
  if (!target) { return Promise.reject(new Error(errMsgs.paramReq)); }

  if (!utils.validator.isFQDN(target) && !utils.validator.isIP(target)) {
    return Promise.reject(new Error(errMsgs.paramBad));
  }

  return lookup(target);
};
