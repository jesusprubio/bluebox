/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../../..').map.services;
const commonOpts = require('../../../cfg/commonOpts/map');
const utils = require('../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.transport = {
  types: 'httpTransport',
  desc: 'Transport protocol to use: http/https',
  default: 'http',
};


module.exports.desc = 'HTTP service mapper';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'http';

  return map(opts.rhosts, finalOpts);
};
