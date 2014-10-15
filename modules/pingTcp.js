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

var ping = require('tcp-ping');


module.exports = (function () {

    return {

        info : {
            name        : 'pingTcp',
            description : 'Ping client (TCP protocol)',
            options     : {
                target : {
                    description  : 'Host to explore',
                    defaultValue : '46.28.246.123',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port to scan on chosen IPs',
                    defaultValue : 80,
                    type         : 'port'
                },
                timeout : {
                    description  : 'Time to wait for a response, in ms.',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                },
                attempts : {
                    description  : 'Number of tryings',
                    defaultValue : 3,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var reqCfg = {
                address   : options.target,
                port     : options.port,
                timeout  : options.timeout,
                attempts : options.attempts
            };

            ping.ping(reqCfg, callback);
        }
    };

}());
