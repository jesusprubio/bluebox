/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../..').dns.brute;


module.exports.description = 'DNS zone transfer';


module.exports.options = {
  server: {
    type: 'allValid',
    description: 'Specify the DNS resolver',
  },
  domain: {
    type: 'domain',
    description: 'Domain to explore',
  },
};


module.exports.run = opts => brute(opts.server, opts.domain);
