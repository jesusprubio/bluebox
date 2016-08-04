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


const ShodanClient = require('shodan-client');


module.exports.help = {
  description: 'Look if the target is indexed by SHODAN computer search engine',
  options: {
    target: {
      type: 'ip',
      description: 'Host to explore',
      defaultValue: '8.8.8.8',
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 10000,
    },
  },
};


module.exports.run = (opts, callback) => {
  const reqOpts = { ip: opts.target };
  const shodanClient = new ShodanClient({
    key: opts.key,
    timeout: parseInt(opts.timeout, 10),
  });

  shodanClient.host(reqOpts, callback);
};
