/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const utils = require('../../../lib/utils');
const lookup = utils.Promise.promisify(require('whois').lookup);


module.exports.desc = 'WHOIS protocol client.';


module.exports.opts = {
  rhost: {
    types: ['domain', 'ip'],
    desc: 'Domain/IP address to explore',
    default: 'google.com',
  },
};


module.exports.impl = (opts = {}) => lookup(opts.rhost);
