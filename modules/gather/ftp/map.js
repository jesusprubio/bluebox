/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const map = require('../../../lib/map');
const commonOpts = require('../../../cfg/commonOpts/map');
const utils = require('../../../lib/utils');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rports.default = [21];


module.exports.desc = 'FTP service mapper.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ftp';

  return map(opts.rhosts, finalOpts);
};
