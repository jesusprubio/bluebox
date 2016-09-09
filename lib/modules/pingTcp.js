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

const ping = require('wushu').pingTcp;


module.exports.description = 'Ping client (TCP protocol)';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '74.125.206.104',
  },
  port: {
    type: 'port',
    description: 'Port to scan on chosen IPs',
    defaultValue: 80,
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    defaultValue: 5000,
  },
  attempts: {
    type: 'positiveInt',
    description: 'Number of tryings',
    defaultValue: 3,
  },
};


module.exports.run = opts => ping(opts.target, opts);
