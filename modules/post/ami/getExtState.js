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
optsCopy.context = {
  desc: 'Context to use in the request',
  default: 'default',
};
optsCopy.extension = {
  desc: 'Extension to use in the request',
  default: '100',
};


module.exports.desc = 'Get actual status of an extension.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  const action = new nami.Actions.ExtensionState();

  finalOpts.proto = 'ami';
  action.context = opts.context;
  action.exten = opts.extension;

  return post(opts.rhost, action, opts);
};
