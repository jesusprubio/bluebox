/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const nami = require('nami');

const post = require('../../../lib/post');
const optsComm = require('../../../cfg/commonOpts/post');


module.exports.desc = 'Get info about the dial plan.';


module.exports.opts = optsComm;


module.exports.impl = (opts = {}) => {
  const optsParsed = opts;
  optsParsed.proto = 'ami';
  const action = new nami.Actions.ShowDialPlan();

  return post(optsParsed.rhost, action, optsParsed);
};
