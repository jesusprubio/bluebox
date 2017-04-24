/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>
            Aan Wahyu <cacaddv@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruterCreds');
const auth = require('../../../lib/protocols/ssh').auth;
const optsComm = require('../../../cfg/commonOpts/bruteCred');
const utils = require('../../../lib/utils');


const optsC = utils.cloneDeep(optsComm);
// The SSH protocol is slow.
// https://github.com/mscdex/ssh2/issues/142
optsC.timeout.default = 20000;


module.exports.desc = 'SSH credentials brute force.';


// To avoid to repeat them in all modules from "brute/creds".
module.exports.opts = optsC;


module.exports.impl = (opts = {}) => bruter(opts.rhost, auth, opts);
