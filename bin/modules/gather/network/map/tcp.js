/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../../../..').map;
const commonOpts = require('../../../../cfg/commonOpts/map');
const utils = require('../../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
// Specific VoIP ports.
optsCopy.rports.default = [
  21, 22, 23, 80, 69, 389, 443, 3306, 4443, 4444,
  5038, 5060, 5061, 5062, 5063, 5064, 5065, 8080,
  8088, 27017,
];


module.exports.desc = 'Network (host/port) scanner using TCP.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'pingTcp';

  return map(opts.rhosts, finalOpts);
};
