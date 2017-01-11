/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../..').dns.brute;


module.exports.description = 'DNS subdomain brute force';


module.exports.options = {
  server: {
    type: 'ip',
    description: 'Specify your custom DNS resolver',
  },
  domain: {
    type: 'domain',
    description: 'Domain to explore',
  },
  rateLimit: {
    type: 'positiveInt',
    description: 'Set the Rate Limit [Default value is 10]',
    defaultValue: 10,
  },
  dictionary: {
    // TODO: Support our own dics.
    // TODO: Add a type to support this
    type: 'allValid',
    description: 'Set the dictionary for bruteforcing [top_50, ...].' +
                 ' Please check the original module: https://github.com/skepticfx/subquest',
    defaultValue: 'top_100',
  },
};


module.exports.run = opts => brute(opts.server, opts.domain, opts);
