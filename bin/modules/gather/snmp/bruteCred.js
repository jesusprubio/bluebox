/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../../../').brute;
const commonOpts = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 161;
optsCopy.communities = {
  types: 'enum',
  desc: 'Community name to test, or path to a file with multiple',
  default: 'public',
};
// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsCopy.users;
delete optsCopy.passwords;
delete optsCopy.userAsPass;


module.exports.desc = 'SNMP communities brute force.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'snmp';
  // We keep the name users because is the one expected in the "brute" method.
  finalOpts.users = opts.communities;

  return brute(opts.rhost, finalOpts);
};
