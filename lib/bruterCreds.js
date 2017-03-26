/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('./utils');
const bruter = require('./bruter');


module.exports = (rhost, brute, opts = {}) => {
  const optsC = utils.cloneDeep(opts);

  optsC.iter1 = optsC.users;
  delete optsC.users;
  if (opts.passwords) {
    optsC.iter2 = optsC.passwords;
    delete optsC.passwords;
  }

  if (optsC.userAsPass) {
    optsC.repeat1 = optsC.userAsPass;
    delete optsC.userAsPass;
  }

  return bruter(rhost, brute, optsC);
};
