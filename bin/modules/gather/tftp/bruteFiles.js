/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../../../').brute;
const commonOpts = require('../../../cfg/commonOpts/bruteCreds');
const utils = require('../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 69;

// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsCopy.users;
delete optsCopy.passwords;
delete optsCopy.userAsPass;

optsCopy.names = {
  types: 'enum',
  desc: 'Resource name to test, or path to a file with multiple.',
  default: 'file:./bin/artifacts/dics/tftp.txt',
};

module.exports.desc = 'TFTP files brute force.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'tftp';
  // We keep the name users because is the one expected in the "brute" method.
  finalOpts.users = finalOpts.names;
  delete finalOpts.names;

  return brute(opts.rhost, finalOpts);
};
