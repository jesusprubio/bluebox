/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nami = require('nami');

const post = require('../../..').post;
const commonOpts = require('../../../cfg/commonOpts/ami');


module.exports.desc = 'List users with voice mail.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ami';
  const action = new nami.Actions.VoicemailUsersList();

  return post(opts.rhost, action, opts);
};
