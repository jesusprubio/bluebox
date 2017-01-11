/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/dns/reverse');
const errMsgs = require('../../lib/utils/errorMsgs');


test('with valid "ip"', (assert) => {
  assert.plan(1);

  method('176.34.131.233')
  .then(res => assert.deepEqual(res, ['ec2-176-34-131-233.eu-west-1.compute.amazonaws.com']));
});


test('without parameters', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with a bad "ip"', (assert) => {
  assert.plan(1);

  method('a')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});
