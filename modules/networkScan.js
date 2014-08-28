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

var dns      = require('native-dns'),
    async    = require('async'),
    evilscan = require('evilscan');


module.exports = (function () {
    
    return {
        
        info : {
            name        : 'networkScan',
            description : 'Host/port network scanner (Evilscanner, only full TCP for now)',
            options     : {
                targets : {
                    description  : 'IP addresses to explore',
                    defaultValue : '127.0.0.1',
                    type         : 'targetsEvil'
                },
                ports : { 
                    description  : 'Port (or list of) to scan on chosen IPs',
                    defaultValue : '21,22,23,80,443,4443,4444,5038,5060-5070,8080',
                    type         : 'ports'
                },
                limit : {
                    description  : 'Max number of request to run in parallel',
                    defaultValue : 10,
                    type         : 'positiveInt'
                },
                status : {
                    description  : 'Get info about ports in this status',
                    defaultValue : 'TROU',
                    type         : 'statusEvil'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                },
                banner : {
                    description  : 'Banner grabbing (not fully implemented)',
                    defaultValue : 'no',
                    type         : 'yesNo'
                }                
            }
        },
                
        run : function (options, callback) {
            var config = {
                    target      : options.targets,
                    port        : options.ports,
                    status      : options.status,
                    banner      : options.banner,
                    timeout     : options.timeout,
                    geo         : false,
                    concurrency : options.limit
                },
                result = [],
                scanner;
            
            scanner = new evilscan(config);

            scanner.on('result', function (data) {
                result.push(data);
            });

            scanner.on('error', function (err) {
                callback(err);
            });

            scanner.on('done', function () {
                callback(null, result);
            });

            scanner.run();
        }
    };

}());