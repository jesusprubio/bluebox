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
const lodash = require('lodash');

const utils = require('../lib/utils');
const Bluebox = require('../');
const pkgInfo = require('../package.json');
const errMsgs = require('../lib/utils/errorMsgs');


// TODO: Check without passing {}
const bluebox = new Bluebox({});


test('method "version"', assert => {
  assert.plan(1);

  assert.deepEqual(bluebox.version(), pkgInfo.version);
});


test('method "help"', assert => {
  assert.plan(1);

  const expectedRes = lodash.extend(
    utils.requireDir(module, '../lib/modules'),
    utils.requireDir(module, '../lib/modules/private')
  );

  assert.deepEqual(bluebox.help(), expectedRes);
});


test('method "run"', assert => {
  assert.plan(2);

  bluebox.run('geolocation', { target: '8.8.8.8' })
  .then(res => {
    assert.equal(res.country_code, 'US');
    assert.equal(res.country_name, 'United States');
  });
});


test('method "run" with invalid module', assert => {
  assert.plan(1);

  bluebox.run('a', {})
  // Needed to be sure it's going through the expected path.
  .then(() => assert.fail('Should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.index.notFound));
});


test('method "run" with invalid param', assert => {
  assert.plan(1);

  const expectedErr = `${errMsgs.index.parseOpts} : "target" : ${errMsgs.types.ip}`;

  bluebox.run('geolocation', { target: 'a' })
  // Needed to be sure it's going through the expected path.
  .then(() => assert.fail('Should fail.'))
  .catch(err => assert.equal(err.message, expectedErr));
});


// TODO: Uncomment when the module is working.
// test('method "run" (Shodan command without key)', assert => {
//  assert.plan(1);
//   const opts = { target: '8.8.8.8' };
//   const expectedErr = 'A SHODAN key is needed to run this module ' +
//     '(https://account.shodan.io/register)';
//
//   bluebox.run('shodanHost', opts)
//   .then(() => assert.fail('Should fail.'))
//   .catch(err => assert.equal(err.message, expectedErr));
// });
// test(`"${fileName}" method "run" (Shodan command without key)`, assert => {


// TODO: getShodanKey, setShodanKey
