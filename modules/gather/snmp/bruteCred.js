/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const auth = require('../../../lib/protocols/snmp').auth;
const optsComm = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
optsC.rport.default = 161;
optsC.communities = {
  types: 'enum',
  desc: 'Community name to test, or path to a file with multiple',
  default: 'public',
};
// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsC.users;
delete optsC.passwords;
delete optsC.userAsPass;


module.exports.desc = 'SNMP communities brute force.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => {
  const optsParsed = opts;

  optsParsed.iter1 = optsParsed.communities;
  delete optsParsed.communities;
  optsParsed.userAsPass = false;

  return bruter(optsParsed.rhost, auth, optsParsed);
};
