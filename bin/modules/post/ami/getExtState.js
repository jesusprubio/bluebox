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
