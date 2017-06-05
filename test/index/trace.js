/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const utils = require('../../lib/utils');
const method = require('../../lib/index/trace');
const errMsgs = require('../../lib/utils/errorMsgs');


test('with valid "target" (domain)', (assert) => {
  assert.plan(4);

  const target = '127.0.0.1';

  method(target)
  .then((res) => {
    assert.equal(res.length, 1);
    assert.deepEqual(utils.keys(res[0]), ['hop', 'ip', 'rtt1']);
    assert.equal(res[0].hop, 1);
    assert.equal(res[0].ip, target);
  });
});


test('without "target"', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with bad "target"', (assert) => {
  assert.plan(1);

  method('a')
  .then(() => assert.fail('should fail.'))
  .catch((err) => { assert.equal(err.message, errMsgs.paramBad); });
});
