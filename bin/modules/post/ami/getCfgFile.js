/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nami = require('nami');

const post = require('../../../..').post;
const commonOpts = require('../../../cfg/commonOpts/post');
const utils = require('../../../lib');

const optsCopy = utils.cloneDeep(commonOpts);
optsCopy.filename = {
  desc: 'Name of the config file to get',
  default: 'manager.conf',
};


module.exports.desc = 'Get a config file of the server.';


module.exports.opts = optsCopy;


module.exports.impl = (opts = {}) => {
  const action = new nami.Actions.GetConfigJson();
  const finalOpts = opts;

  finalOpts.proto = 'ami';
  action.filename = opts.filename;

  return post(opts.rhost, action, opts);
};
