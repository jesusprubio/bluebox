/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const errMsgs = require('../../../bin/lib/errorMsgs');
const method = require('../../../bin/lib/parseOpts');


test('with no parameters', (assert) => {
  assert.plan(1);
  assert.deepEqual(method({}, {}), {});
});


test('with no parameters (passing someone)', (assert) => {
  assert.plan(1);
  assert.deepEqual(method({ rhost: '9.9.9.9' }, {}), {});
});


test('with single parameter', (assert) => {
  const expectedOpts = { rhost: { type: 'ip' } };
  const passedOpts = { rhost: '9.9.9.9' };

  assert.plan(1);
  assert.deepEqual(method(passedOpts, expectedOpts), passedOpts);
});


test('with multiple parameters', (assert) => {
  const expectedOpts = { rhost: { type: 'ip' }, rport: { type: 'port' } };
  const passedOpts = { rhost: '9.9.9.9', rport: '8888' };

  assert.plan(1);
  assert.deepEqual(method(passedOpts, expectedOpts), {
    rhost: passedOpts.rhost,
    rport: parseInt(passedOpts.rport, 10),
  });
});


test('with type non valid type', (assert) => {
  const expectedOpts = { rhost: { type: 'a' } };
  const passedOpts = { rhost: '9.9.9.9' };
  const expectedErr = new RegExp(`"target" : ${errMsgs.parseOpts.notFound} : a`);

  assert.plan(1);
  assert.throws(() => { method(passedOpts, expectedOpts); }, expectedErr);
});


test('without a non optional', (assert) => {
  const expectedOpts = { rhost: { type: 'ip' } };
  const expectedErr = new RegExp(`"target" : ${errMsgs.parseOpts.required}`);

  assert.plan(1);
  assert.throws(() => { method({}, expectedOpts); }, expectedErr);
});


test('without an optional takes the default', (assert) => {
  const expectedOpts = { rhost: { type: 'ip', default: '8.8.8.8' } };

  assert.plan(1);
  assert.deepEqual(method({}, expectedOpts), { rhost: expectedOpts.rhost.default });
});


test('with a non valid value', (assert) => {
  const expectedOpts = { rhost: { type: 'ip' }, rport: { type: 'port' } };
  const passedOpts = { rhost: 'a', rport: '8888' };
  // TODO: Get from the proper file.
  const expectedErr = new RegExp(`"target" : ${errMsgs.types.ip}`);

  assert.plan(1);
  assert.throws(() => { method(passedOpts, expectedOpts); }, expectedErr);
});
