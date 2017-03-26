/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../lib/mapper');
const map = require('../../../lib/protocols/http').map;
const optsComm = require('../../../cfg/commonOpts/map');
const utils = require('../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
optsC.transport = {
  types: 'httpTransport',
  desc: 'Transport protocol to use: http/https',
  default: 'http',
};


module.exports.desc = 'HTTP service mapper.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
