/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('../../../lib/utils');

const axfr = utils.Promise.promisify(require('dns-axfr').resolveAxfr);


module.exports.desc = 'DNS zone transfer.';


module.exports.opts = {
  server: {
    desc: 'Specify the DNS resolver',
  },
  domain: {
    types: 'domain',
    desc: 'Domain to explore',
  },
};


module.exports.impl = (opts = {}) => axfr(opts.server, opts.domain);
