/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const nami = require('nami');

const post = require('../../../lib/post');
const optsComm = require('../../../cfg/commonOpts/post');
const utils = require('../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
optsC.context = {
  desc: 'Context to use in the request',
  default: 'default',
};
optsC.extension = {
  desc: 'Extension to use in the request',
  default: '100',
};


module.exports.desc = 'Get actual status of an extension.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => {
  const optsParsed = opts;
  const action = new nami.Actions.ExtensionState();

  optsParsed.proto = 'ami';
  action.context = opts.context;
  action.exten = opts.extension;

  return post(optsParsed.rhost, action, optsParsed);
};
