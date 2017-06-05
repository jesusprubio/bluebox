/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('../../../lib/utils');

const axfr = utils.promisify(require('dns-axfr').resolveAxfr);


module.exports.desc = 'DNS zone transfer.';


module.exports.opts = {
  domain: {
    types: 'domain',
    desc: 'Domain to explore',
  },
  server: {
    desc: 'Specify the DNS resolver',
  },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    axfr(opts.server, opts.domain)
    .then(res => resolve(res.answers))
    .catch((err) => {
      // Expected result, not vulnerable.
      if (err === -3) {
        resolve('null');
      } else {
        reject(err);
      }
    });
  });
