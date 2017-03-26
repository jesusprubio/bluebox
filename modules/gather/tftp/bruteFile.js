/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruter');
const getFile = require('../../../lib/protocols/tftp').getFile;
const optsComm = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
optsC.rport.default = 69;

// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsC.users;
delete optsC.passwords;
delete optsC.userAsPass;

optsC.names = {
  types: 'enum',
  desc: 'Resource name to test, or path to a file with multiple. Some built-in' +
        ' dics are supported ("misc/dicNames", ie: file:john)"',
  default: 'file:tftp',
};


module.exports.desc = 'TFTP files brute force.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => {
  const optsParsed = opts;

  optsParsed.iter1 = optsC.names;
  delete optsParsed.names;
  optsParsed.userAsPass = false;

  return bruter(optsParsed.rhost, getFile, optsParsed);
};
