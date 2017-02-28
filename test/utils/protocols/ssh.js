/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const methods = require('../../../lib/protocols/ssh');

// Defined in the Docker env.
const serverCfg = {
  ip: '127.0.0.1',
  userName: 'js',
  password: 'js',
};
// We're in local environment, should be fast.
const opts = { timeout: 5000 };


test('(scan) with valid ip', (assert) => {
  assert.plan(1);

  methods.scan(serverCfg.ip)
  .then(res => assert.equal(res, null));
});

test('(auth) with invalid username', (assert) => {
  assert.plan(1);

  const credPair = ['ola', serverCfg.password];

  methods.auth(serverCfg.ip, credPair, opts)
  .then(res => assert.equal(res, null));
});


test('(auth) with invalid password', (assert) => {
  assert.plan(1);

  const credPair = [serverCfg.userName, 'kase'];

  methods.auth(serverCfg.ip, credPair, opts)
  .then(res => assert.equal(res, null));
});


test('(auth) with valid credentials', (assert) => {
  assert.plan(1);

  const credPair = [serverCfg.userName, serverCfg.password];

  methods.auth(serverCfg.ip, credPair, opts)
  .then(res => assert.deepEqual(res, credPair));
});


test('(auth) with non reached port', (assert) => {
  assert.plan(1);

  const credPair = [serverCfg.userName, serverCfg.password];
  opts.port = 9999;
  const expectedErr = `connect ECONNREFUSED ${serverCfg.ip}:${opts.port}`;

  methods.auth(serverCfg.ip, credPair, opts)
  .then(() => assert.fail('Should fail.'))
  .catch(err => assert.equal(err.message, expectedErr));
});
