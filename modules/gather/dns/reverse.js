/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const dns = require('dns');

const utils = require('../../../lib/utils');

const reverse = utils.Promise.promisify(dns.reverse);


module.exports.desc = 'DNS inverse resolution.';


module.exports.opts = {
  rhost: {
    types: 'ip',
    desc: 'Host to explore',
    default: '8.8.8.8',
  },
};


module.exports.impl = (opts = {}) => reverse(opts.rhost);
