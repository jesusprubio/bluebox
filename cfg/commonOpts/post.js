/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

const utils = require('../../lib/utils');
const optsB = require('./base');

const opts = utils.cloneDeep(optsB);

opts.user = {
  desc: 'Valid username',
  default: 'admin',
};

opts.password = {
  desc: 'Valid username',
  default: 'admin',
};


module.exports = opts;
