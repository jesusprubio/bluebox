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


// Private stuff

var ShodanClient = require('shodan-client'),

    HELP = {
        description: 'Quick access to popular SHODAN related queries',
        options: {
            tag: {
                type: 'allValid',
                description: 'Specific tag to search about. Use "all" to avoid filtering',
                defaultValue : 'voip'
            },
            timeout : {
                type: 'positiveInt',
                description: 'Time to wait for a response, in ms.',
                defaultValue: 10000
            }
        }
    };


// Public stuff

module.exports.help = HELP;

module.exports.run = function (options, callback) {
    var reqOptions  = {
        timeout: options.timeout
    },
    shodanClient = new ShodanClient(reqOptions);

    if (options.tag === 'all') {
        shodanClient.popular(callback);
    } else {
        shodanClient.popularTag(options.tag, callback);
    }
};
