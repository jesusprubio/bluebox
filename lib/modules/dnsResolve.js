/*
  Copyright Jesus Perez <jesusprubio gmail com>
            Sergio Garcia <s3rgio.gr gmail com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

const request = require('wushu').dns.resolve;


module.exports.description = 'DNS resolution for all the records type';


module.exports.options = {
  domain: {
    type: 'domain',
    description: 'domain to explore',
    defaultValue: 'google.com',
  },
  // TODO: Still not implemented in wushu.
  // server: {
  //   type: 'ip',
  //   description: 'DNS server to make the request on',
  //   defaultValue: '87.216.170.85',
  // },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response (ms.)',
    defaultValue: 5000,
  },
  // TODO: Add an option to ask for an specific type.
};


module.exports.run = opts => request(opts.domain, opts);
