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

var Tftp   = require('tftp-client'),
    async  = require('async'),
    lodash = require('lodash'),
    
    printer = require('../utils/printer');


module.exports = (function () {
    
    return {
        
        info : {
            name        : 'tftpBrute',
            description : 'Try to brute-force valid credentials for the TFTP protocol',
            options     : {
                target : {
                    description  : 'IP address to brute-force',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port of the server',
                    defaultValue : 69,
                    type         : 'port'
                },
                fileList : {
                    description  : 'File (or file with them) to test',
                    defaultValue : 'test',
                    type         : 'userPass'
                },
                delay : {
                    description  : 'Delay between requests in ms.',
                    defaultValue : 0,
                    type         : 'positiveInt'
                }
            }
        },
                
        run : function (options, callback) {
            var result      = [],
                indexCount  = 0; // User with delay to know in which index we are
            
            // We avoid to parallelize here to control the interval of the requests
            async.eachSeries(options.fileList, function (file, asyncCb) {
                var client = new Tftp(options.port, options.target);

                function delayCb () {
                    if (indexCount === options.fileList.length) {
                        asyncCb();
                    } else {
                        setTimeout(asyncCb, options.delay);
                    }
                }

                indexCount += 1;
                
                client.read(file, function (err, data) {
                    // TODO: Destroy/close client, not supported by the module
                    if (err) {
                        if (/File not found/.test(err)) {
                            printer.infoHigh('File NOT found : ' + file);
                            delayCb();
                        } else {
                            asyncCb(err);
                        }
                    } else {
                        result.push({ file : file });
                        printer.highlight('File found: ' + file);
                        delayCb();
                    }
                });
            }, function (err) {
                callback(err, result);
            });
        }
	};
	
}());