/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const errMsgs = require('../../lib/utils/errorMsgs');
const method = require('../../lib/index/brute');

// TODO: Get from a file -> share with the Dockerfile in this way
// with an env. var.
const serverCfg = {
  ip: '127.0.0.1',
  userName: 'root',
  password: 'js',
};
const opts = {
  protocol: 'http',
  port: 8080,
  users: [serverCfg.userName],
  userAsPass: false,
  timeout: 5000,
};


test('with valid "ip" and a single valid credential', (assert) => {
  assert.plan(1);

  opts.passwords = [serverCfg.password];

  method(serverCfg.ip, opts)
  .then(res => assert.deepEqual(res, [[serverCfg.userName, serverCfg.password]]));
});


test('with valid "ip" and single invalid credential', (assert) => {
  assert.plan(1);

  opts.passwords = ['ola'];

  method(serverCfg.ip, opts)
  .then(res => assert.deepEqual(res, []));
});


test('with valid "ip" and multiple valid and invalid credentials', (assert) => {
  assert.plan(1);

  opts.passwords = ['ola', serverCfg.password];

  method(serverCfg.ip, opts)
  .then(res => assert.deepEqual(res, [[serverCfg.userName, serverCfg.password]]));
});


// TODO: It needs a different user in the server.
// test('with non valid credentials but "userAsPass" is valid', (assert) => {
//   assert.plan(1);

//   opts.users = ['js'];
//   // Any non valid is ok here, the correct is "js".
//   opts.passwords = ['ola'];
//   opts.userAsPass = true;

//   method(serverCfg.ip, opts)
//   .then(res => assert.deepEqual(res, [[opts.users[0], opts.users[0]]]));
// });


test('without parameters', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with invalid "ip"', (assert) => {
  assert.plan(1);

  method('a', opts)
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("port")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { port: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("users")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { users: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("passwords")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { passwords: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("userAsPass")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { userAsPass: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("concurrency")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { concurrency: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("delay")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { delay: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with invalid option ("timeout")', (assert) => {
  assert.plan(1);

  method(serverCfg.ip, { timeout: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with valid "ip" and non-reachable port', (assert) => {
  assert.plan(1);

  opts.port = 6666;

  method(serverCfg.ip, opts)
  .then(() => assert.fail('Should fail.'))
  .catch(err => assert.match(err.message, 'ECONNREFUSED'));
});
