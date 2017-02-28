/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const nami = require('nami');

const post = require('../../../lib/post');
const commonOpts = require('../../../cfg/commonOpts/post');

const utils = require('../../../lib/utils');

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
