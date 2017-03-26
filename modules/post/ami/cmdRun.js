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
optsC.comm = {
  desc: 'Command to run (ie: sip show channels/peers/registry, ' +
        'database show, show version)',
  default: 'sip show users',
};


module.exports.desc = 'Run a command the server.';


module.exports.opts = optsC;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.Command();
  const optsParsed = opts;

  optsParsed.proto = 'ami';
  action.command = optsParsed.comm;

  return post(optsParsed.rhost, action, optsParsed);
};
