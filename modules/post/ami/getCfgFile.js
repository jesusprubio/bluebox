/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const nami = require('nami');

const post = require('../../../lib/post');
const optsComm = require('../../../cfg/commonOpts/post');
const utils = require('../../../lib/utils');

const optsC = utils.cloneDeep(optsComm);
optsC.filename = {
  desc: 'Name of the config file to get',
  default: 'manager.conf',
};


module.exports.desc = 'Get a config file of the server.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.GetConfigJson();
  const optsParsed = opts;

  optsParsed.proto = 'ami';
  action.filename = optsParsed.filename;

  return post(optsParsed.rhost, action, optsParsed);
};
