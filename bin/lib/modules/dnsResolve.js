/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const request = require('../../..').dns.resolve;


module.exports.description = 'DNS resolution for all the records type';


module.exports.options = {
  domain: {
    type: 'domain',
    description: 'domain to explore',
    defaultValue: 'google.com',
  },
  // TODO: Still not implemented in wushu.
  // server: {
  //   type: 'ip',
  //   description: 'DNS server to make the request on',
  //   defaultValue: '87.216.170.85',
  // },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response (ms.)',
    defaultValue: 5000,
  },
  // TODO: Add an option to ask for an specific type.
};


module.exports.run = opts => request(opts.domain, opts);
