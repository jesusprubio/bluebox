/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../lib/mapper');
const map = require('../../../lib/protocols/ami').map;
const optsComm = require('../../../cfg/commonOpts/map');
const utils = require('../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
optsC.rports.default = [5038];


module.exports.desc = 'AMI service mapper.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
