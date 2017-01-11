/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';


const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../../lib/utils/protocols/ftp');

// Defined in the Docker env.
const serverCfg = {
  ip: '127.0.0.1',
  userName: 'js',
  password: 'js',
};
// We're in local environment, should be fast.
const opts = { timeout: 5000 };


test('with invalid username', (assert) => {
  assert.plan(1);

  const credPair = ['ola', serverCfg.password];

  method(serverCfg.ip, credPair, opts)
  .then(res => assert.equal(res, null));
});


test('with invalid password', (assert) => {
  assert.plan(1);

  const credPair = [serverCfg.userName, 'kase'];

  method(serverCfg.ip, credPair, opts)
  .then(res => assert.equal(res, null));
});


test('with valid credentials', (assert) => {
  assert.plan(1);

  const credPair = [serverCfg.userName, serverCfg.password];

  method(serverCfg.ip, credPair, opts)
  .then(res => assert.deepEqual(res, credPair));
});


// TODO: we have some another TODO in the tested file we need to solve
// to get this one working.
// test('with non reached port', (assert) => {
//   assert.plan(1);
//
//   const credPair = [serverCfg.userName, serverCfg.password];
//   opts.port = 9999;
//   const expectedErr = `connect ECONNREFUSED ${serverCfg.ip}:${opts.port}`;
//
//   method(serverCfg.ip, credPair, opts)
//   .then(() => assert.fail('Should fail.'))
//   .catch(err => assert.equal(err.message, expectedErr));
// });
