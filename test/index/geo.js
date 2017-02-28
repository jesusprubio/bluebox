/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/index/geo');
const errMsgs = require('../../lib/utils/errorMsgs');
const utils = require('../../lib/utils');


test('with a public IP address', (assert) => {
  assert.plan(4);

  method('1.1.1.1')
  .then((res) => {
    assert.deepEqual(utils.keys(res), [
      'country_code', 'country_name', 'region_code', 'region_name', 'city',
      'zip_code', 'time_zone', 'latitude', 'longitude', 'metro_code',
    ]);
    // Checking only the first values (#kiss).
    assert.equal(res.city, 'Research');
    assert.equal(res.country_code, 'AU');
    assert.equal(res.country_name, 'Australia');
  });
});


test('with a private IP address', (assert) => {
  assert.plan(4);

  method('192.168.0.1')
  .then((res) => {
    assert.deepEqual(utils.keys(res), [
      'country_code', 'country_name', 'region_code', 'region_name', 'city',
      'zip_code', 'time_zone', 'latitude', 'longitude', 'metro_code',
    ]);
    assert.equal(res.city, '');
    assert.equal(res.country_code, '');
    assert.equal(res.country_name, '');
  });
});


test('without parameters', (assert) => {
  assert.plan(1);

  method()
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramReq));
});


test('with bad "ip"', (assert) => {
  assert.plan(1);

  method('a')
  .then(() => assert.fail('should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.paramBad));
});
