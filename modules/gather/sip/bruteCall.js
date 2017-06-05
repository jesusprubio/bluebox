/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruter');
const optsBrute = require('../../../cfg/commonOpts/bruteCred');
const optsSip = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');
const proto = require('../../../lib/protocols/sip');

const dbg = utils.dbg(__filename);

const optsComm = {};
utils.defaultsDeep(optsComm, optsBrute, optsSip);
optsComm.rport.default = 5060;
optsComm.concurrency.default = proto.concurrency;

// Reusing as much as possible.
optsComm.fromExt = utils.cloneDeep(optsComm.users);
optsComm.toExt = utils.cloneDeep(optsComm.users);
delete optsComm.users;
delete optsComm.passwords;
delete optsComm.userAssPass;


module.exports.desc = 'SIP NO-authenticated call check.';


module.exports.opts = optsComm;


// We can't reuse the "brute" implementation here, we should
// complicate it a lot.
module.exports.impl = (opts = {}) => {
  const optsParsed = utils.cloneDeep(opts);

  optsParsed.iter1 = opts.fromExt;
  optsParsed.iter2 = opts.toExt;

  dbg('Starting, opts', opts);
  return bruter(optsParsed.rhost, proto.checkCall, optsParsed);
};
