/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const scanner = require('node-wifiscanner');

const utils = require('../../../../lib/utils');


module.exports.desc = 'Wifi access point scanner.';


module.exports = () => utils.Promise.promisify(scanner.scan);
