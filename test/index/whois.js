/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/index/whois');
const errMsgs = require('../../lib/utils/errorMsgs');


test('with a valid "target" (domain)', (assert) => {
  method('facebook.com')
  .then((res) => {
    const lines = res.split('\n');

    assert.equal(lines[0], 'Domain Name: facebook.com');
    assert.equal(lines[1], 'Registry Domain ID: 2320948_DOMAIN_COM-VRSN');
    assert.equal(lines[2], 'Registrar WHOIS Server: whois.markmonitor.com');

    // We need to wait between tests to avoid "ECONNRESET" errors.
    // We use "assert.end" instead ".plan" to get this working.
    setTimeout(() => {
      assert.end();
    }, 5000);
  });
});


test('with a valid "target" (IP)', (assert) => {
  assert.plan(5);

  method('8.8.8.8')
  .then((res) => {
    const lines = res.split('\n');

    assert.equal(lines[0], '');
    assert.equal(lines[1], '#');
    assert.equal(lines[18], 'NetRange:       8.0.0.0 - 8.255.255.255');
    assert.equal(lines[19], 'CIDR:           8.0.0.0/8');
    assert.equal(lines[20], 'NetName:        LVLT-ORG-8-8');
  });

  setTimeout(() => {
    assert.end();
  }, 5000);
});


test('without parameters', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with a bad "target"', (assert) => {
  assert.plan(1);

  method('a')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});
