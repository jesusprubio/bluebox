// /*
//   Copyright Jesús Pérez <jesusprubio@fsf.org>

//   This code may only be used under the MIT license found at
//   https://opensource.org/licenses/MIT.
// */

// 'use strict';

// const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

// const method = require('../../.lib/index/pingTcp');
// const errMsgs = require('../../lib/utils/errorMsgs');
// const utils = require('../../lib/utils');


// test('with valid "ip" and options', (assert) => {
//   assert.plan(4);

//   const opts = { port: 443 };

//   method('74.125.206.104', opts)
//   .then((res) => {
//     assert.deepEqual(utils.keys(res), ['port', 'attempts', 'avg', 'max', 'min', 'results']);
//     assert.equal(res.port, opts.port);
//     assert.equal(res.results.length, 3);
//     assert.deepEqual(utils.keys(res.results[0]), ['seq', 'time']);
//   });
// });


// test('without "ip")', (assert) => {
//   assert.plan(1);

//   method()
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramReq));
// });


// test('with bad "ip"', (assert) => {
//   assert.plan(1);

//   method('a')
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramBad));
// });


// test('with bad option ("port")', (assert) => {
//   assert.plan(1);

//   method('74.125.206.104', { port: 'a' })
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramBad));
// });


// test('with bad option ("attempts")', (assert) => {
//   assert.plan(1);

//   method('74.125.206.104', { attempts: 'a' })
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramBad));
// });


// test('with bad option ("timeout")', (assert) => {
//   assert.plan(1);

//   method('74.125.206.104', { timeout: 'a' })
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramBad));
// });
