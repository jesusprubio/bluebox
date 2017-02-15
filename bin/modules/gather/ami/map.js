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
optsCopy.rports.default = [5038];


module.exports.desc = 'AMI service mapper';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ami';

  return map(opts.rhost, finalOpts);
};
