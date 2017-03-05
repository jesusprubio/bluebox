/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../lib/mapper');
const map = require('../../../lib/protocols/sip').map;
const mapComOpts = require('../../../cfg/commonOpts/map');
const sipComOpts = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');


const commonOpts = {};
utils.defaultsDeep(commonOpts, mapComOpts, sipComOpts);
commonOpts.rports.default = [5060, 5061];
// It's better to scan with an OPTIONS request (commonly less restricted)
commonOpts.meth.default = 'OPTIONS';


module.exports.desc = 'SIP service mapper.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
