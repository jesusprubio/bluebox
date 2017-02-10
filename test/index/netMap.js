/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/map/net');
// const errMsgs = require('../../lib/utils/errorMsgs');


test('with valid "range"', (assert) => {
  assert.plan(2);
  const targets = '127.0.0.1';

  method(targets)
  .then((res) => {
    assert.equal(res.length, 4);
    assert.deepEqual(Object.keys(res[0]), ['ip', 'port', 'status']);
  });
});


// test('without parameters', (assert) => {
//   assert.plan(1);

//   method()
//   .then(() => assert.fail('should fail.'))
//   .catch(err => assert.equal(err.message, errMsgs.paramReq));
// });
