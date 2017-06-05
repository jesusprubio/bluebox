/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const proto = require('../../../lib/protocols/sip');
const optsBrute = require('../../../cfg/commonOpts/bruteCred');
const optsSip = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');

const optsComm = {};
utils.defaultsDeep(optsComm, optsBrute, optsSip);
optsComm.rport.default = 5060;
optsComm.concurrency.default = proto.concurrency;


module.exports.desc = 'SIP credentials (extension/password) brute force.';


module.exports.opts = optsComm;


module.exports.impl = (opts = {}) => bruter(opts.rhost, proto.auth, opts);
