/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const brute = require('../../../lib/brute');
const bruteComOpts = require('../../../cfg/commonOpts/bruteCred');
const sipComOpts = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');

const commonOpts = {};
utils.defaultsDeep(commonOpts, bruteComOpts, sipComOpts);
commonOpts.rport.default = 5060;
// We have the control of this library so we can take more "risk" here
commonOpts.meth.concurrency = 10000;


module.exports.desc = 'SIP credentials (extension/password) brute force.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'sip';

  return brute(opts.rhost, finalOpts);
};
