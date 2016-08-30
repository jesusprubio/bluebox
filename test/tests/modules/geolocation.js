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

const method = require('../../../lib/modules/geolocation');


test('with a public IP address', assert => {
  const opts = { target: '8.8.8.8' };

  return method.run(opts)
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


test('with a private IP address', assert => {
  const opts = { target: '192.168.0.1' };

  return method.run(opts)
  .then(res => {
    const expected = {
      ip: opts.target,
      country_code: '',
      country_name: '',
      region_code: '',
      region_name: '',
      city: '',
      time_zone: '',
      zip_code: '',
      latitude: 0,
      longitude: 0,
      metro_code: 0,
    };

    assert.deepEqual(res, expected, 'should be equivalent to empty stuff');
  });
});


/* We don't need to check with bad parameters here because
we are going to pass always good ones. We have a parser
with its own tests for it. */
