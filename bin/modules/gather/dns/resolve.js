/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const request = require('../../../..').dns.resolve;


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
  timeout: {
    types: 'natural',
    desc: 'Time to wait for a response (ms.)',
    default: 5000,
  },
  // TODO: Add an option to ask for an specific type.
};


module.exports.impl = opts => request(opts.domain, opts);
