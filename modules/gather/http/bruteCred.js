/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const auth = require('../../../lib/protocols/http').auth;
const optsComm = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils/');

// We don't want to modify the original.
const optsC = utils.cloneDeep(optsComm);
optsC.rport.default = 80;
optsC.transport = {
  types: 'httpTransport',
  desc: 'Transport protocol to use: http/https',
  default: 'http',
};


module.exports.desc = 'HTTP credentials brute force.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => bruter(opts.rhost, auth, opts);
