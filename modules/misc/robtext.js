/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const utils = require('../../lib/utils');

const baseUrl = 'https://www.robtex.com/';


module.exports.desc = 'Get the URL to a target in Robtex.';


module.exports.opts = {
  rhost: {
    types: ['ip', 'domain'],
    desc: 'IP address or domain name to use in the search',
    default: 'example.com',
  },
};


module.exports.impl = (opts = {}) => {
  if (utils.validator.isIP(opts.rhost)) {
    if (utils.validator.isPrivateIp(opts.rhost)) {
      return Promise.resolve('Private IP');
    }
    return Promise.resolve(`${baseUrl}ip-lookup/${opts.rhost}`);
  }

  return Promise.resolve(`${baseUrl}dns-lookup/${opts.rhost}`);
};
