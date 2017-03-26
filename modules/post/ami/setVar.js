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
optsC.channel = {
  desc: 'Channel to use in the request',
  default: 'SIP/100@default',
};
optsC.variable = {
  desc: 'Name of the variable to get',
  default: 'extension',
};


module.exports.desc = 'Set the value of a config variable.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.SetVar();
  const optsParsed = opts;

  optsParsed.proto = 'ami';
  action.channel = opts.channel;
  action.variable = opts.variable;

  return post(optsParsed.rhost, action, optsParsed);
};
