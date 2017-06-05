/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const subquest = require('subquest');


module.exports.desc = 'DNS subdomain brute force.';


module.exports.opts = {
  domain: {
    types: 'domain',
    desc: 'Domain to explore',
  },
  server: {
    types: 'ip',
    desc: 'Specify your custom DNS resolver',
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
  bing: {
    types: 'bool',
    describe: 'Use Bing search to list all possible subdomains',
    default: true,
  },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    subquest.getSubDomains({
      host: opts.domain,
      dnsServer: opts.server,
      rateLimit: opts.rateLimit,
      dictionary: opts.dictionary,
      bingSearch: opts.bing,
    })
    .on('end', arr => resolve(arr))
    .on('error', err => reject(err));
  });
