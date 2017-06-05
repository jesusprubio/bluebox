/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/dns/axfr');
const errMsgs = require('../../lib/utils/errorMsgs');


test('with valid parameters but not existent DNS' +
     ' servers (not legal in some countries)', (assert) => {
  assert.plan(1);

  method('dns01.nonexistent.com', 'nonexistent.com')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, '-4'));
});


test('without "server"', (assert) => {
  assert.plan(1);

  method(null, 'nonexistent.com')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('without "domain"', (assert) => {
  assert.plan(1);

  method('dns01.nonexistent.com')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with bad "server"', (assert) => {
  assert.plan(1);

  method('a', 'nonexistent.com')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with bad "domain"', (assert) => {
  assert.plan(1);

  method('dns01.nonexistent.com', 'b')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});
