/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

// TODO: This module doesn't support to set a connection timeout, send a PR.
const errMsgs = require('../utils/errorMsgs');
const utils = require('../utils');

const Promise = utils.Promise;
const getLoc = Promise.promisify(require('iplocation'));


function massage(obj) {
  const finalRes = obj;

  delete finalRes.ip;

  return finalRes;
}


/* Returning a promise */
module.exports = ip =>
  new Promise((resolve, reject) => {
    if (!ip) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if (!utils.validator.isIP(ip)) {
      reject(new Error(errMsgs.paramBad));

      return;
    }

    getLoc(ip)
    .then(res => resolve(massage(res)));
  });
