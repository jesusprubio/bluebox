/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const brute = require('../../../lib/protocols/http').bruteCreds;
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


module.exports.impl = (opts = {}) => bruter(opts.rhost, brute, opts);
