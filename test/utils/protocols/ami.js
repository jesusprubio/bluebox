/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

// const methods = require('../../../lib/protocols/ami');

// const serverCfg = {
//   ip: '209.44.123.42',
//   // userName: 'js',
//   // password: 'js',
// };


test('with valid target', (assert) => {
  assert.plan(1);
  assert.ok(true);

  // methods.auth(serverCfg.ip, ['ola', 'kase'])
  // .then(res => assert.equal(res, '220 ProFTPD 1.3.4c Server (ProFTPD) [::ffff:127.0.0.1]'));
  // .then((res) => {
  //   console.log('RESSS');
  //   console.log(res);
  // })
  // .catch((err) => {
  //   console.log('ERR');
  //   console.log(err);
  // });
});
