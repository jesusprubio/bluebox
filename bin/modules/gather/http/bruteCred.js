/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../../..').brute;
const commonOpts = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib');

// We don't want to modify the original.
const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 80;
optsCopy.transport = {
  types: 'httpTransport',
  desc: 'Transport protocol to use: http/https',
  default: 'http',
};


module.exports.desc = 'HTTP credentials brute force.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'http';
  finalOpts.transport = opts.transport;

  return brute(opts.rhost, finalOpts);
};
