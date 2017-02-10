/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const scan = require('../../../..').wifi.scanAps;


module.exports.desc = 'Wifi access point scanner';


module.exports.impl = () => scan();
