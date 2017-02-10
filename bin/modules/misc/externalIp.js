/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const getIp = require('../../..').externalIp;


module.exports.desc = 'Get your external IP address (icanhazip.com)';


module.exports.impl = () => getIp();
