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

const pathToName = require('../../lib/utils/utils').pathToName;
const obj = require('../../lib/utils/types');

const fileName = pathToName(__filename);


test(`"${fileName}" method "ip"`, assert => {
  assert.plan(1);
  assert.equal(obj.ip('8.8.8.8'), '8.8.8.8');
});


test(`"${fileName}" method "ip" (with invalid value)`, assert => {
  const expectedErr = new RegExp('Any valid IPv4/IPv6 single address');

  assert.plan(1);
  assert.throws(() => { obj.ip('a'); }, expectedErr);
});


test(`"${fileName}" method "ips" (single IP)`, assert => {
  assert.plan(1);
  assert.deepEqual(obj.ips('8.8.8.8'), ['8.8.8.8']);
});


test(`"${fileName}" method "ips" (single IP with invalid value)`, assert => {
  const expectedErr = new RegExp('Any valid IPv4/IPv6 single address');

  assert.plan(1);
  assert.throws(() => { obj.ips('a'); }, expectedErr);
});


test(`"${fileName}" method "ips" (IPv4 range)`, assert => {
  assert.plan(1);
  assert.deepEqual(obj.ips('192.168.0.1-3'), [
    '192.168.0.1',
    '192.168.0.2',
    '192.168.0.3',
  ]);
});

// TODO: Finish this.
