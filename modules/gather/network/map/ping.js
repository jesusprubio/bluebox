/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../../lib/mapper');
const map = require('../../../../lib/protocols/ping').map;
const optsComm = require('../../../../cfg/commonOpts/map');
const utils = require('../../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsC.rports;


module.exports.desc = 'Network (host) scanner using ping.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
