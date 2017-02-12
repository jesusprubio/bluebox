/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../..').map.services;
const scanComOpts = require('../../cfg/commonOpts/scan');


module.exports.desc = 'Ping mapper';


module.exports.opts = scanComOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ping';

  return map(opts.rhost, finalOpts);
};
