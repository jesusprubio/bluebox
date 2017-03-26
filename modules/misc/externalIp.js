/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const getIp = require('icanhazip').IPv4;


module.exports.desc = 'Get your external IP address.';


module.exports.impl = () => getIp();
