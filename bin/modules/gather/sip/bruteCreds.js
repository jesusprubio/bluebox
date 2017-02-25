/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../../..').brute;
const bruteComOpts = require('../../../cfg/commonOpts/bruteCreds');
const sipComOpts = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib');


// const optsCopy = utils.cloneDeep(commonOpts);

// Note that SIP ones take precedence, "rport" affected in this case.
const commonOpts = {};
utils.defaultsDeep(commonOpts, bruteComOpts, sipComOpts);


module.exports.desc = 'SIP credentials (extension/password) brute force.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'sip';

  return brute(opts.rhost, finalOpts);
};
