// Copyright Jesus Perez <jesusprubio gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const test = require('tap').test;

const pathToName = require('../../../lib/utils').pathToName;
const errMsgs = require('../../../lib/utils/errorMsgs');
const method = require('../../../lib/utils/parseOpts');

const fileName = pathToName(__filename);


test(`"${fileName}" with no parameters`, assert => {
  assert.plan(1);
  assert.deepEqual(method({}, {}), {});
});


test(`"${fileName}" with no parameters (passing someone)`, assert => {
  assert.plan(1);
  assert.deepEqual(method({ target: '9.9.9.9' }, {}), {});
});


test(`"${fileName}" with single parameter`, assert => {
  const expectedOpts = { target: { type: 'ip' } };
  const passedOpts = { target: '9.9.9.9' };

  assert.plan(1);
  assert.deepEqual(method(passedOpts, expectedOpts), passedOpts);
});


test(`"${fileName}" with multiple parameters`, assert => {
  const expectedOpts = { target: { type: 'ip' }, port: { type: 'port' } };
  const passedOpts = { target: '9.9.9.9', port: '8888' };

  assert.plan(1);
  assert.deepEqual(method(passedOpts, expectedOpts), {
    target: passedOpts.target,
    port: parseInt(passedOpts.port, 10),
  });
});


test(`"${fileName}" with type non valid type`, assert => {
  const expectedOpts = { target: { type: 'a' } };
  const passedOpts = { target: '9.9.9.9' };
  const expectedErr = new RegExp(`"target" : ${errMsgs.parseOpts.notFound} : a`);

  assert.plan(1);
  assert.throws(() => { method(passedOpts, expectedOpts); }, expectedErr);
});


test(`"${fileName}" without a non optional`, assert => {
  const expectedOpts = { target: { type: 'ip' } };
  const expectedErr = new RegExp(`"target" : ${errMsgs.parseOpts.required}`);

  assert.plan(1);
  assert.throws(() => { method({}, expectedOpts); }, expectedErr);
});


test(`"${fileName}" without an optional takes the default`, assert => {
  const expectedOpts = { target: { type: 'ip', defaultValue: '8.8.8.8' } };

  assert.plan(1);
  assert.deepEqual(method({}, expectedOpts), { target: expectedOpts.target.defaultValue });
});


test(`"${fileName}" with a non valid value`, assert => {
  const expectedOpts = { target: { type: 'ip' }, port: { type: 'port' } };
  const passedOpts = { target: 'a', port: '8888' };
  // TODO: Get from the proper file.
  const expectedErr = new RegExp(`"target" : ${errMsgs.types.ip}`);

  assert.plan(1);
  assert.throws(() => { method(passedOpts, expectedOpts); }, expectedErr);
});
