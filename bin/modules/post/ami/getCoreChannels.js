/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nami = require('nami');

const post = require('../../../..').post;
const commonOpts = require('../../../cfg/commonOpts/post');


module.exports.desc = 'Get info about the channels of the servers\'s core.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ami';
  const action = new nami.Actions.CoreShowChannels();

  return post(opts.rhost, action, opts);
};
