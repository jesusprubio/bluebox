/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const getLoc = require('geoip-lite').lookup;

const utils = require('../../../lib/utils');

module.exports.desc = 'Geolocate a host.';


module.exports.opts = {
  rhost: {
    types: 'ip',
    desc: 'Host to explore',
    default: '8.8.8.8',
  },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    if (utils.validator.isPrivateIp(opts.rhost)) {
      resolve('Private IP');

      return;
    }

    try {
      resolve(getLoc(opts.rhost));
    } catch (err) {
      reject(err);
    }
  });
