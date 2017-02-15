/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../../..').map.services;
const scanComOpts = require('../../../cfg/commonOpts/map');
const sipComOpts = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib');


// Note that SIP ones take precedence.
const commonOpts = utils.defaults(sipComOpts, scanComOpts);

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rports.default = [5060, 5061];


module.exports.desc = 'SIP service mapper';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'sip';

  return map(opts.rhost, finalOpts);
};
