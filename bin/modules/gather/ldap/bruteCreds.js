/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../..').bruteCreds;
const commonOpts = require('../../../cfg/commonOpts/bruteCreds');
const utils = require('../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rport.default = 389;
optsCopy.users.description = `${optsCopy.users.description}, ie: cn=admin,dc=quobislab,dc=com`;


module.exports.desc = 'LDAP credentials brute force';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ldap';

  return brute(opts.rhost, finalOpts);
};
