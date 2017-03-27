/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const wifiName = require('wifi-name');


module.exports.desc = 'Wifi access point scanner.';


module.exports.impl = wifiName;
