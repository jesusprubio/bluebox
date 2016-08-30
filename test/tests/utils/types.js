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

const obj = require('../../../lib/utils/types');
const errMsgs = require('../../../lib/utils/errorMsgs').types;


test('method "ip"', assert => {
  assert.plan(1);
  assert.equal(obj.ip('8.8.8.8'), '8.8.8.8');
});


test('method "ip" (with invalid value)', assert => {
  const expectedErr = new RegExp(errMsgs.ip);

  assert.plan(1);
  assert.throws(() => { obj.ip('a'); }, expectedErr);
});


test('method "ips" (single IP)', assert => {
  assert.plan(1);
  assert.deepEqual(obj.ips('8.8.8.8'), ['8.8.8.8']);
});


test('method "ips" (single IP with invalid value)', assert => {
  const expectedErr = new RegExp(errMsgs.ip);

  assert.plan(1);
  assert.throws(() => { obj.ips('a'); }, expectedErr);
});


test('method "ips" (IPv4 range)', assert => {
  assert.plan(1);
  assert.deepEqual(obj.ips('192.168.0.1-3'), [
    '192.168.0.1',
    '192.168.0.2',
    '192.168.0.3',
  ]);
});

// TODO: Finish this.
