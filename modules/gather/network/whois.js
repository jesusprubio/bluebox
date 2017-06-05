/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const utils = require('../../../lib/utils');
const lookup = utils.promisify(require('whois').lookup);


module.exports.desc = 'WHOIS protocol client.';


module.exports.opts = {
  rhost: {
    types: ['domain', 'ip'],
    desc: 'Domain/IP address to explore',
    default: 'google.com',
  },
};


module.exports.impl = (opts = {}) => lookup(opts.rhost);
