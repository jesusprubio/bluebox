/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../..').map.services;
const commonOpts = require('../../cfg/commonOpts/map');
const utils = require('../../lib');

const optsCopy = utils.cloneDeep(commonOpts);


// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete optsCopy.users;
delete optsCopy.rports;


module.exports.desc = 'Ping mapper';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ping';

  return map(opts.rhosts, finalOpts);
};
