/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const brute = require('../../../lib/brute');
const commonOpts = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils/');

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
