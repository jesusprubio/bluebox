/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const brute = require('../../../lib/protocols/mongo').bruteCreds;
const commonOpts = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 27017;


module.exports.desc = 'MongoDB credentials brute force.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => bruter(opts.rhost, brute, opts);
