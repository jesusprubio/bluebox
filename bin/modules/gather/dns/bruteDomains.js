/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../../../').dns.brute;


module.exports.desc = 'DNS subdomain brute force.';


module.exports.opts = {
  server: {
    types: 'ip',
    desc: 'Specify your custom DNS resolver',
  },
  domain: {
    types: 'domain',
    desc: 'Domain to explore',
  },
  rateLimit: {
    types: 'natural',
    desc: 'Set the Rate Limit [Default value is 10]',
    default: 10,
  },
  dictionary: {
    // TODO: Support our own dics.
    // TODO: Add a type to support this
    desc: 'Set the dictionary for bruteforcing [top_50, ...].' +
                 ' Please check the original module: https://github.com/skepticfx/subquest',
    default: 'top_100',
  },
};


module.exports.impl = opts => brute(opts.domain, opts.server, opts);
