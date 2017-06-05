/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const scanner = require('node-wifiscanner');

// const utils = require('../../../lib/utils');


module.exports.desc = 'Wifi access point mapper.';


// TODO: Not working.
// module.exports.impl = () => utils.promisify(scanner.scan);

module.exports.impl = () =>
  new Promise((resolve, reject) => {
    scanner.scan((err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
