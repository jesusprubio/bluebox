/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
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
