/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/dns/resolve');
const errMsgs = require('../../lib/utils/errorMsgs');
const utils = require('../../lib/utils');


test('with valid domain and record type', (assert) => {
  assert.plan(1);

  const expected = {
    MX: [{
      exchange: 'mail.ribadeo.org',
      priority: 10,
    }],
  };

  method('ribadeo.org', { rtype: 'MX' })
  .then(res => assert.deepEqual(res, expected));
});


test('without domain only', (assert) => {
  assert.plan(6);


  method('iojs.org')
  .then((res) => {
    assert.deepEqual(res.A, ['104.131.173.199']);
    assert.deepEqual(res.AAAA, ['2604:a880:800:10::126:a001']);
    assert.equal(res.TXT.length, 2);
    assert.equal(res.MX.length, 2);
    assert.deepEqual(utils.keys(res.SOA), [
      'nsname', 'hostmaster', 'serial', 'refresh',
      'retry', 'expire', 'minttl',
    ]);
    assert.equal(res.NS.length, 2);
  });
});


test('without parameters', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with bad "domain"', (assert) => {
  assert.plan(1);

  method('a')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});


test('with bad option ("rtype")', (assert) => {
  assert.plan(1);

  method('example.com', { rtype: 'a' })
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});
