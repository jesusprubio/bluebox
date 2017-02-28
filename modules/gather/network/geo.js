/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const getLoc = require('geoip-lite').lookup;


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
    try {
      resolve(getLoc(opts.rhost));
    } catch (err) {
      reject(err);
    }
  });
