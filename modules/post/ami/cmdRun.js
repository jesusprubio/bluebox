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
optsCopy.comm = {
  desc: 'Command to run (ie: sip show channels/peers/registry, ' +
        'database show, show version)',
  default: 'sip show users',
};


module.exports.desc = 'Run a command the server.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.Command();
  const finalOpts = opts;

  finalOpts.proto = 'ami';
  action.command = opts.comm;

  return post(opts.rhost, action, opts);
};
