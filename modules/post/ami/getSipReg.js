/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nami = require('nami');

const post = require('../../../lib/post');
const commonOpts = require('../../../cfg/commonOpts/post');


module.exports.desc = 'Get SIP registry info.';


module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ami';
  const action = new nami.Actions.SipShowRegistry();

  return post(opts.rhost, action, opts);
};
