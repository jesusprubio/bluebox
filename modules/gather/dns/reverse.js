/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const dns = require('dns');

const utils = require('../../../lib/utils');

const reverse = utils.promisify(dns.reverse);


module.exports.desc = 'DNS inverse resolution.';


module.exports.opts = {
  rhost: {
    types: 'ip',
    desc: 'Host to explore',
    default: '8.8.8.8',
  },
  server: {
    types: 'ip',
    desc: 'DNS server to make the request on',
    default: '198.101.242.72',
  },
};


module.exports.impl = (opts = {}) => {
  dns.setServers([opts.server]);

  return reverse(opts.rhost);
};
