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
  assert.plan(3);

  method.run({ target: '8.8.8.8' })
  .then(res => {
    assert.equal(res.country_code, 'US');
    assert.equal(res.country_name, 'United States');
  });
});


test('with a private IP address', assert => {
  assert.plan(3);

  method.run({ target: '192.168.0.1' })
  .then(res => {
    assert.equal(res.country_code, '');
    assert.equal(res.country_name, '');
  });
});


/* We don't need to check with bad parameters here because
we are going to pass always good ones. We have a parser
with its own tests for it. */
