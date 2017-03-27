/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

const utils = require('../../lib/utils');
const optsB = require('./base');
const optsC = require('./concurrent');

const opts = {};
utils.defaultsDeep(opts, optsB, optsC);

opts.users = {
  types: 'enum',
  desc: 'User (ie: "admin"), range or file with them (ie: file:../miDic.txt).' +
        'Some built-in dics are supported ("misc/dicNames", ie: file:john)',
  default: 'range:1000-1010',
};

opts.passwords = {
  types: 'enum',
  desc: 'Passwords (or file with them, same that for "users") to test',
  default: 'range:1000-1010',
};

opts.userAsPass = {
  types: 'bool',
  desc: 'Test the same user as password for each one',
  default: false,
};

opts.delay = {
  types: 'natural',
  desc: 'Delay between requests, in ms.',
  default: 0,
};

opts.concurrency = {
  types: 'natural',
  desc: 'Max number of active requests.',
  default: 100,
};


module.exports = opts;
