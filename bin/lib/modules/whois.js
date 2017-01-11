/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const whois = require('../../..').whois;


module.exports.description = 'WHOIS protocol client';


module.exports.options = {
  domain: {
    type: 'host',
    description: 'Domain/IP address to explore',
    defaultValue: 'google.com',
  },
};


module.exports.run = opts => whois(opts.domain);
