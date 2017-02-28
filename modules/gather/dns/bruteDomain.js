/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const subquest = require('subquest');


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
    desc: 'Set the dictionary for bruteforcing [top_50, ...].' +
                 ' Please check the original module: https://github.com/skepticfx/subquest',
    default: 'top_100',
  },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    subquest.getSubDomains({
      host: opts.domain,
      dnsServer: opts.server,
      rateLimit: opts.rateLimit || 10,
      dictionary: opts.dictionary || 'top_100',
    })
    .on('end', arr => resolve(arr))
    .on('error', err => reject(err));
  });
