/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('./utils');
const bruter = require('./bruter');


module.exports = (rhost, brute, opts = {}) => {
  const optsCopy = utils.cloneDeep(opts);

  optsCopy.iter1 = optsCopy.users;
  delete optsCopy.users;
  if (opts.passwords) {
    optsCopy.iter2 = optsCopy.passwords;
    delete optsCopy.passwords;
  }

  if (optsCopy.userAsPass) {
    optsCopy.repeat1 = optsCopy.userAsPass;
    delete optsCopy.userAsPass;
  }

  return bruter(rhost, brute, optsCopy);
};
