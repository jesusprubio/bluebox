/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../../lib/map');
const scanComOpts = require('../../../cfg/commonOpts/map');
const sipComOpts = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');


const commonOpts = {};
utils.defaultsDeep(commonOpts, scanComOpts, sipComOpts);
commonOpts.rports.default = [5060, 5061];
// It's better to scan with an OPTIONS request (commonly less restricted)
commonOpts.meth.default = 'OPTIONS';


module.exports.desc = 'SIP service mapper.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'sip';

  return map(opts.rhosts, finalOpts);
};
