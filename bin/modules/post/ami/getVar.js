/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nami = require('nami');

const post = require('../../..').post;
const commonOpts = require('../../../cfg/commonOpts/ami');

const utils = require('../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.channel = {
  desc: 'Channel to use in the request',
  default: 'SIP/100@default',
};
optsCopy.variable = {
  desc: 'Name of the variable to get',
  default: 'extension',
};


module.exports.desc = 'Get the value of a config variable.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.GetVar();
  const finalOpts = opts;

  finalOpts.proto = 'ami';
  action.channel = opts.channel;
  action.variable = opts.variable;

  return post(opts.rhost, action, opts);
};
