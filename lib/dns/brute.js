/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const subquest = require('subquest');

const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');


module.exports = (domain, server, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!domain || !server) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if (!utils.validator.isFQDN(domain) || !utils.validator.isIP(server)) {
      reject(new Error(errMsgs.paramBad));

      return;
    }

    subquest.getSubDomains({
      host: domain,
      dnsServer: server,
      rateLimit: opts.rateLimit || 10,
      dictionary: opts.dictionary || 'top_100',
    })
    .on('end', arr => resolve(arr))
    .on('error', err => reject(err));
  });
