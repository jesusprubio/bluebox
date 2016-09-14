/*
  Copyright Jesus Perez <jesusprubio gmail com>

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

const search = require('wushu').shodan.host;


module.exports.description = 'Look if the target is indexed by SHODAN computer search engine';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '8.8.8.8',
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    // Sometimes the API is too slow.
    defaultValue: 20000,
  },
};


module.exports.run = opts => {
  const finalOpts = opts;

  // We prefer to get all the records SHODAN have about this host.
  finalOpts.history = true;

  return search(opts.target, opts.key, finalOpts);
};
