/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const errMsgs = require('../../../bin/lib/utils/errorMsgs');
const method = require('../../../bin/lib/utils/parseOpts');


test('with no parameters', (assert) => {
  assert.plan(1);
  assert.deepEqual(method({}, {}), {});
});


test('with no parameters (passing someone)', (assert) => {
  assert.plan(1);
  assert.deepEqual(method({ target: '9.9.9.9' }, {}), {});
});


test('with single parameter', (assert) => {
  const expectedOpts = { target: { type: 'ip' } };
  const passedOpts = { target: '9.9.9.9' };

  assert.plan(1);
  assert.deepEqual(method(passedOpts, expectedOpts), passedOpts);
});


test('with multiple parameters', (assert) => {
  const expectedOpts = { target: { type: 'ip' }, port: { type: 'port' } };
  const passedOpts = { target: '9.9.9.9', port: '8888' };

  assert.plan(1);
  assert.deepEqual(method(passedOpts, expectedOpts), {
    target: passedOpts.target,
    port: parseInt(passedOpts.port, 10),
  });
});


test('with type non valid type', (assert) => {
  const expectedOpts = { target: { type: 'a' } };
  const passedOpts = { target: '9.9.9.9' };
  const expectedErr = new RegExp(`"target" : ${errMsgs.parseOpts.notFound} : a`);

  assert.plan(1);
  assert.throws(() => { method(passedOpts, expectedOpts); }, expectedErr);
});


test('without a non optional', (assert) => {
  const expectedOpts = { target: { type: 'ip' } };
  const expectedErr = new RegExp(`"target" : ${errMsgs.parseOpts.required}`);

  assert.plan(1);
  assert.throws(() => { method({}, expectedOpts); }, expectedErr);
});


test('without an optional takes the default', (assert) => {
  const expectedOpts = { target: { type: 'ip', defaultValue: '8.8.8.8' } };

  assert.plan(1);
  assert.deepEqual(method({}, expectedOpts), { target: expectedOpts.target.defaultValue });
});


test('with a non valid value', (assert) => {
  const expectedOpts = { target: { type: 'ip' }, port: { type: 'port' } };
  const passedOpts = { target: 'a', port: '8888' };
  // TODO: Get from the proper file.
  const expectedErr = new RegExp(`"target" : ${errMsgs.types.ip}`);

  assert.plan(1);
  assert.throws(() => { method(passedOpts, expectedOpts); }, expectedErr);
});
