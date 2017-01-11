/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');
const axfr = utils.Promise.promisify(require('dns-axfr').resolveAxfr);


module.exports = (server, domain) => {
  if (!domain || !server) {
    return Promise.reject(new Error(errMsgs.paramReq));
  }

  if (!utils.validator.isFQDN(domain) ||
     (!utils.validator.isFQDN(server) && !utils.validator.isIP(server))) {
    return Promise.reject(new Error(errMsgs.paramBad));
  }

  return axfr(server, domain);
};
