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

var libnmap = require('node-libnmap');


module.exports = (function () {
    
    return {
        
        info : {
            name        : 'networkScan',
            description : 'Host/port network scanner (Evilscanner, only full TCP for now)',
            options     : {
                targets : {
                    description  : 'IP address range to explore',
                    defaultValue : '192.168.0.0/24',
                    type         : 'nmapTargets'
                },
                ports : { 
                    description  : 'Port (or list of) to scan on chosen IPs',
                    defaultValue : '21,22,23,80,443,4443,4444,5038,5060-5070,8080',
                    type         : 'nmapPorts'
                },
                binPath : { 
                    description  : 'Path of the nmap binary',
                    defaultValue : '/usr/local/bin/nmap',
                    type         : 'anyString'
                }                
            }
        },
                
        run : function (options, callback) {
            var opts = {
                range : [options.targets], // array mandatory here
                ports : options.ports, // a string here
                nmap  : options.binPath
            };
                        
            // TODO: Not working, "uncaughtException" in the client to the rescue
            try {
                // TODO: Something failing here, only the first ones are scanned
                libnmap.nmap('scan', opts, function (err, report) {
                    callback(err, report);
                });
            } catch (err) {
                callback(err);
            }
        } 
    };

}());