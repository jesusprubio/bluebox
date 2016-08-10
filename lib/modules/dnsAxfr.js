// Copyright Jesus Perez <jesusprubio gmail com>
//           Sergio Garcia <s3rgio.gr gmail com>
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


const dns = require('dns-axfr');

module.exports.help = {
  description: 'DNS zone transfer',
  options: {
    domain: {
      type: 'domain',
      description: 'Domain to explore',
      defaultValue: 'acme.com',
    },
    server: {
      // TODO
      type: 'allValid',
      description: 'Server to use',
      defaultValue: 'dns01.acme.com',
    },
  },
};


module.exports.run = (options, callback) => {
  dns.resolveAxfr(options.server, options.domain, callback);
};
