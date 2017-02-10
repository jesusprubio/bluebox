/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const whois = require('../../..').whois;


module.exports.desc = 'WHOIS protocol client';


module.exports.opts = {
  rhost: {
    types: ['domain', 'ip'],
    desc: 'Domain/IP address to explore',
    default: 'google.com',
  },
};


module.exports.impl = opts => whois(opts.rhost);
