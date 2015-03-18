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
        description: 'Look if the target is indexed by SHODAN computer search engine',
        options: {
            // TODO: Automatically included, maybe we need to deacoplate
//            key: {
//                type: 'allValid',
//                description: 'Your SHODAN API key',
//                defaultValue: null
//            },
            target: {
                type: 'ip',
                description: 'Host to explore',
                defaultValue: '8.8.8.8'
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
    var reqOptions = { ip: options.target },
        shodanClient;

    if (options.key) {
        shodanClient = new ShodanClient({
            key: options.key,
            timeout: parseInt(options.timeout)
        });

        shodanClient.host(reqOptions, callback);
    } else {
        callback({
            message: 'A SHODAN key is needed to run this module ' +
                     '(https://account.shodan.io/register)',
            error: null
        });
    }
};
