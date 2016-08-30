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
  description: 'Find potential targets in SHODAN computer search engine',
  options: {
    query: {
      type: 'allValid',
      description: 'Query to search about, could include port, country, product, etc.',
      defaultValue: 'openssh',
    },
    pages: {
      type: 'positiveInt',
      description: 'Number of pages (of results) to return (only 1 allowed with free accounts)',
      defaultValue: 1,
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 10000,
    },
  },
};


module.exports.run = (opts, callback) => {
  const reqOpts = {
    query: opts.query,
    // facets: 'port:100',
    page: parseInt(opts.pages, 10),
  };
  const shodanClient = new ShodanClient({
    key: opts.key,
    timeout: parseInt(opts.timeout, 10),
  });

  shodanClient.search(reqOpts, callback);
};
