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
const getLoc = require('geoip-lite').lookup;


module.exports = rhost =>
  new Promise((resolve, reject) => {
    if (!rhost) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if (!utils.validator.isIP(rhost)) {
      reject(new Error(errMsgs.paramBad));

      return;
    }

    try {
      resolve(getLoc(rhost));
    } catch (err) {
      reject(err);
    }
  });
