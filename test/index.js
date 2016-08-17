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
const requireDir = require('require-directory');

const pathToName = require('../lib/utils/utils').pathToName;
const errMsgs = require('../lib/utils/errorMsgs').index;
const Bluebox = require('../');
const pkgInfo = require('../package.json');


const fileName = pathToName(__filename);
// TODO: Check without passing {}
const bluebox = new Bluebox({});


test(`"${fileName}" method "version"`, assert => {
  assert.plan(1);
  assert.deepEqual(bluebox.version(), pkgInfo.version);
});


test(`"${fileName}" method "help"`, assert => {
  const expectedRes = lodash.extend(
    requireDir(module, '../lib/modules'),
    requireDir(module, '../lib/modules/private')
  );


  assert.plan(1);
  assert.deepEqual(bluebox.help(), expectedRes);
});


test(`"${fileName}" method "run"`, assert => {
  const opts = { target: '8.8.8.8' };

  return bluebox.run('geolocation', opts)
  .then(res => {
    const expected = {
      ip: opts.target,
      country_code: 'US',
      country_name: 'United States',
      region_code: 'CA',
      region_name: 'California',
      city: 'Mountain View',
      time_zone: 'America/Los_Angeles',
      zip_code: '94035',
      latitude: 37.386,
      longitude: -122.0838,
      metro_code: 807,
    };

    assert.deepEqual(res, expected);
  });
});


test(`"${fileName}" method "run" with invalid module`, assert => {
  const opts = {};
  const expectedErr = errMsgs.notFound;

  return bluebox.run('a', opts)
  // Needed to be sure it's going through the expected path.
  .then(() => assert.fail('Should fail.'))
  .catch(err => { assert.equal(err.message, expectedErr); });
});


test(`"${fileName}" method "run" with invalid param`, assert => {
  const opts = { target: 'a' };
  // TODO: Get also the second part from the proper file.
  const expectedErr = `${errMsgs.parseOpts}: "target" : Any valid IPv4/IPv6 single address`;

  return bluebox.run('geolocation', opts)
  // Needed to be sure it's going through the expected path.
  .then(() => assert.fail('Should fail.'))
  .catch(err => { assert.equal(err.message, expectedErr); });
});


// TODO: Uncomment when the module is working.
// test(`"${fileName}" method "run" (Shodan command without key)`, assert => {
//   const opts = { target: '8.8.8.8' };
//   const expectedErr = 'A SHODAN key is needed to run this module ' +
//     '(https://account.shodan.io/register)';
//
//   return bluebox.run('shodanHost', opts)
//   .then(() => assert.fail('Should fail.'))
//   .catch(err => { assert.equal(err.message, expectedErr); });
// });
// test(`"${fileName}" method "run" (Shodan command without key)`, assert => {


// TODO: getShodanKey, setShodanKey
