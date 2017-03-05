/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const brute = require('../../../lib/protocols/mysql').bruteCreds;
const commonOpts = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 3306;


module.exports.desc = 'MYSQL credentials brute force.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => bruter(opts.rhost, brute, opts);
