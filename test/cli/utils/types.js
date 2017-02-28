/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const obj = require('../../../bin/lib/parsers');
const errMsgs = require('../../../bin/cfg/errorMsgs').types;


test('method "ip"', (assert) => {
  assert.plan(1);
  assert.equal(obj.ip('8.8.8.8'), '8.8.8.8');
});


test('method "ip" (with invalid value)', (assert) => {
  const expectedErr = new RegExp(errMsgs.ip);

  assert.plan(1);
  assert.throws(() => { obj.ip('a'); }, expectedErr);
});


test('method "ips" (single IP)', (assert) => {
  assert.plan(1);
  assert.deepEqual(obj.ips('8.8.8.8'), ['8.8.8.8']);
});


test('method "ips" (single IP with invalid value)', (assert) => {
  const expectedErr = new RegExp(errMsgs.ip);

  assert.plan(1);
  assert.throws(() => { obj.ips('a'); }, expectedErr);
});


test('method "ips" (IPv4 range)', (assert) => {
  assert.plan(1);
  assert.deepEqual(obj.ips('192.168.0.1-3'), [
    '192.168.0.1',
    '192.168.0.2',
    '192.168.0.3',
  ]);
});

// TODO: Finish this.
