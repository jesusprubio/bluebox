/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const dns = require('dns');

const utils = require('../../../lib/utils');

const resolveDns = utils.promisify(dns.resolve);
const recordTypes = [
  'A', 'AAAA', 'MX', 'TXT', 'SRV', 'PTR', 'NS',
  'CNAME', 'SOA', 'NAPTR',
];


module.exports.desc = 'DNS resolution for all the record types.';


module.exports.opts = {
  domain: {
    types: 'domain',
    desc: 'domain to explore',
    default: 'google.com',
  },
  // TODO: Still not implemented in the lib.
  // server: {
  //   types: 'ip',
  //   desc: 'DNS server to make the request on',
  //   default: '87.216.170.85',
  // },
  // timeout: {
  //   types: 'natural',
  //   desc: 'Time to wait for a response (ms.)',
  //   default: 5000,
  // },
  // TODO: Add an option to ask for an specific type.
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve) => {
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
        resolveDns(opts.domain, type)
        .then((res) => {
          result[type] = res;
          resolve2();
        })
        // We resolve the promise instead of reject to avoid a break.
        // We didn't store the result in this case.
        .catch(() => resolve2());
      });

    utils.pMap(finalTypes, request, { concurrency: 10 })
    .then(() => resolve(result));
  });
