/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';


const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const methods = require('../../../lib/utils/protocols/ftp');

const serverCfg = {
  ip: '127.0.0.1',
  userName: 'js',
  password: 'js',
};
// We're in local environment, should be fast.
// const opts = { timeout: 1000 };


test('with valid target', (assert) => {
  assert.plan(1);

  // methods.scan(serverCfg.ip, opts)
  methods.scan(serverCfg.ip)
  .then(res => assert.equal(res, '220 ProFTPD 1.3.4c Server (ProFTPD) [::ffff:127.0.0.1]'));
});

test('with invalid username', (assert) => {
  assert.plan(1);

  // methods.scan(serverCfg.ip, opts)
  methods.auth(serverCfg.ip, ['ola', 'kase'])
  .then(res => assert.equal(res, null));
});


// test('with invalid username', (assert) => {
//   assert.plan(1);

//   const credPair = ['ola', serverCfg.password];

//   methods.auth(serverCfg.ip, credPair, opts)
//   .then(res => assert.equal(res, null));
// });


// test('with invalid password', (assert) => {
//   assert.plan(1);

//   const credPair = [serverCfg.userName, 'kase'];

//   method(serverCfg.ip, credPair, opts)
//   .then(res => assert.equal(res, null));
// });


// test('with valid credentials', (assert) => {
//   assert.plan(1);

//   const credPair = [serverCfg.userName, serverCfg.password];

//   method(serverCfg.ip, credPair, opts)
//   .then(res => assert.deepEqual(res, credPair));
// });


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
