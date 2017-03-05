/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../lib/mapper');
const map = require('../../../lib/protocols/ssh').map;
const commonOpts = require('../../../cfg/commonOpts/map');
const utils = require('../../../lib/utils');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.rports.default = [22];


module.exports.desc = 'SSH service mapper.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
