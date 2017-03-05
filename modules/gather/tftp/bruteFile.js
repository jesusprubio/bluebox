/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruter');
const brute = require('../../../lib/protocols/tftp').bruteFile;
const commonOpts = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 69;

// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsCopy.users;
delete optsCopy.passwords;
delete optsCopy.userAsPass;

optsCopy.names = {
  types: 'enum',
  desc: 'Resource name to test, or path to a file with multiple. Some built-in' +
        ' dics are supported ("misc/dicNames", ie: file:john)"',
  default: 'file:tftp',
};


module.exports.desc = 'TFTP files brute force.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;

  finalOpts.iter1 = finalOpts.names;
  delete finalOpts.names;
  finalOpts.userAsPass = false;

  return bruter(opts.rhost, brute, finalOpts);
};
