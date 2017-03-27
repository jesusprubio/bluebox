/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../../lib/mapper');
const map = require('../../../../lib/protocols/tcp').map;
const optsComm = require('../../../../cfg/commonOpts/map');
const utils = require('../../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
// Specific VoIP ports.
optsC.rports.default = [
  21, 22, 23, 80, 69, 389, 443, 3306, 4443, 4444,
  5038, 5060, 5061, 5062, 5063, 5064, 5065, 8080,
  8088, 27017,
];
optsC.banner = {
  types: 'bool',
  desc: 'Try to capture the server banner (slower).',
  default: false,
};


module.exports.desc = 'Network (host/port) scanner using TCP.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
