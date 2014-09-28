/*
 Copyright Sergio García <s3rgio.gr gmail com>

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

var subquest    = require('subquest');


module.exports = (function () {

    return {

        info : {
            name        : 'dnsBrute',
            description : 'DNS brute force',
            options     : {
                domain : {
                    description  : 'Domain to explore',
                    defaultValue : 'google.com',
                    type         : 'domain'
                },
                resolver : {
                    description  : 'Specify your custom DNS resolver',
                    defaultValue : '87.216.170.85',
                    type         : 'targetIp'
                },
                ratelimit : {
                    description  : "Set the Rate Limit [Default value is 10]",
                    defaultValue : 10,
                    type         : 'positiveInt'
                },
                dictionary : {
                    description  : 'Set the dictionary for bruteforcing [top_100]',
                    defaultValue : 'top_100',
                    type         : 'dnsDictionary'
                }
            }
        },

        run : function (options, callback) {
            subquest.find(options, callback);

        }
    };

}());