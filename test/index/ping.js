/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/index/ping');
const errMsgs = require('../../lib/utils/errorMsgs');
const utils = require('../../lib/utils');


test('with valid "ip"', (assert) => {
  assert.plan(9);

  const host0 = '8.8.8.8';
  const host1 = '104.20.22.46';
  const host2 = '1.1.1.1';

  method([host0, host1, host2])
  .then((res) => {
    assert.equal(res[0].host, host0);
    assert.equal(res[1].host, host1);
    assert.equal(res[2].host, host2);
    assert.equal(res[0].alive, true);
    assert.equal(res[1].alive, true);
    assert.equal(res[2].alive, false);
    assert.deepEqual(utils.keys(res[0]), ['host', 'alive', 'output', 'time']);
    assert.deepEqual(utils.keys(res[1]), ['host', 'alive', 'output', 'time']);
    assert.deepEqual(utils.keys(res[2]), ['host', 'alive', 'output', 'time']);
  });
});


test('with no parameters', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


// TODO: Not working
// test('with bad "ips"', (assert) => {
//   assert.plan(1);
//
//   method(['a'])
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramBad));
// });


test('with bad "ips (no Array)"', (assert) => {
  assert.plan(1);

  method('a')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


// TODO: Still not working.
// test('with bad option ("timeout")', (assert) => {
//   assert.plan(1);
//
//   method('127.0.0.1', { timeout: 'a' })
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramBad));
// });


test('with bad option ("attempts")', (assert) => {
  assert.plan(1);

  method(['127.0.0.1'], { timeout: 500, attempts: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});
