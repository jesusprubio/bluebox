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

const brute = require('wushu').dns.brute;


module.exports.description = 'DNS subdomain brute force';


module.exports.options = {
  server: {
    type: 'ip',
    description: 'Specify your custom DNS resolver',
  },
  domain: {
    type: 'domain',
    description: 'Domain to explore',
  },
  rateLimit: {
    type: 'positiveInt',
    description: 'Set the Rate Limit [Default value is 10]',
    defaultValue: 10,
  },
  dictionary: {
    // TODO: Support our own dics.
    // TODO: Add a type to support this
    type: 'allValid',
    description: 'Set the dictionary for bruteforcing [top_50, ...].' +
                 ' Please check the original module: https://github.com/skepticfx/subquest',
    defaultValue: 'top_100',
  },
};


module.exports.run = opts => brute(opts.server, opts.domain, opts);
