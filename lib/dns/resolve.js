/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const dns = require('dns');

const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');

const Promise = utils.Promise;
const resolveDns = Promise.promisify(dns.resolve);
const recordTypes = [
  'A', 'AAAA', 'MX', 'TXT', 'SRV', 'PTR', 'NS',
  'CNAME', 'SOA', 'NAPTR',
];


// TODO: This module should be much easier when they publish this.
// https://github.com/nodejs/node/issues/2848

module.exports = (domain, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!domain) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if (!utils.validator.isFQDN(domain) ||
       (opts.rtype && !utils.includes(recordTypes.concat('ANY'), opts.rtype))) {
      reject(new Error(errMsgs.paramBad));

      return;
    }

    let finalTypes;
    // Single record type support.
    if (opts.rtype && opts.rtype !== 'ANY') {
      finalTypes = [opts.rtype];
    } else {
      finalTypes = recordTypes;
    }

    // We need to return an object from a ".map" generated promise.
    const result = {};

    // We can't return the result of the ".map" directly because we
    // need to massage the returned data.
    const request = type =>
      new Promise((resolve2) => {
        resolveDns(domain, type)
        .then((res) => {
          result[type] = res;
          resolve2();
        })
        // We resolve the promise instead of reject to avoid a break.
        // We didn't store the result in this case.
        .catch(() => resolve2());
      });

    // TODO: Review "concurrency" #perfmatters
    Promise.map(finalTypes, request, { concurrency: 5 })
    .then(() => resolve(result));
  });
