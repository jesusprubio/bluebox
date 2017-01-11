/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const obj = require('../../../bin/lib/utils/types');
const errMsgs = require('../../../bin/lib/utils/errorMsgs').types;


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
