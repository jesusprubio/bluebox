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

const method = require('../../../lib/modules/whois');


test('with a valid domain', assert => {
  const opts = { domain: 'google.com' };

  return method.run(opts)
  .then(res => {
    const lines = res.split('\n');

    // Checking only the first values (#kiss).
    assert.equal(lines[0], 'Domain Name: google.com');
    assert.equal(lines[1], 'Registry Domain ID: 2138514_DOMAIN_COM-VRSN');
    assert.equal(lines[2], 'Registrar WHOIS Server: whois.markmonitor.com');
  });
});
