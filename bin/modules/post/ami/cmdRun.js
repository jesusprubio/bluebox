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
optsCopy.comm = {
  desc: 'Command to run (ie: sip show channels/peers/registry, ' +
        'database show, show version)',
  default: 'sip show users',
};


module.exports.desc = 'Run a command the server';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.Command();
  const finalOpts = opts;

  finalOpts.proto = 'ami';
  action.command = opts.comm;

  return post(opts.rhost, action, opts);
};
