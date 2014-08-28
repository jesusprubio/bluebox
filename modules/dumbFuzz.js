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

var async  = require('async'),

    printer        = require('../utils/printer'),
    utils          = require('../utils/utils'),
    SteroidsSocket = require('../utils/steroidsSocket');


module.exports = (function () {
    
    return {
        
        info : {
            name : 'dumbFuzz',
            description : 'Really stupid app layer fuzzer (underlying support: UDP, TCP, TLS, [secure] websockects)',
            options     : {
                target : {
                    description  : 'IP address to fuzz',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port to use',
                    defaultValue : '5060',
                    type         : 'port'
                },
                transport : {
                    description  : 'Underlying protocol',                    
                    defaultValue : 'UDP',
                    type         : 'protocols'
                },
                wsPath : {
                    description  : 'Websockets path (only when websockets)',
                    defaultValue : 'ws',
                    type         : 'anyString'
                },
                wsProto : {
                    description  : 'Websockets protocol (only when websockets)',
                    defaultValue : 'sip',
                    type         : 'anyString'
                },
                tlsType : {
                    description  : 'Version of TLS protocol to use (only when TLS)',
                    defaultValue : 'SSLv3',
                    type         : 'tlsType'
                },
                string : {
                    description  : 'String or char to send',
                    defaultValue : 'A',
                    type         : 'anyString'
                },
                minLen : {
                    description  : 'Min. lenght of the string to fuzz',
                    defaultValue : 1,
                    type         : 'anyString'
                },
                maxLen : {
                    description  : 'Max. lenght of the string to fuzz',
                    defaultValue : 1000,
                    type         : 'anyString'
                },
                delay : {
                    description  : 'Delay between requests in ms. (use "async" to concurrent)',
                    defaultValue : 0,
                    type         : 'delay'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                }                
            }
        },
                
        run : function (options, callback) {
            var fakeIndex   = [],
                fuzzStrings = [],
                limit       = 1,
                indexCount  = 0, // User with delay to know in which index we are
                lastAnswer  = null,
                minLen      = parseInt(options.minLen),
                maxLen      = parseInt(options.maxLen),
                initString  = '',
                megaSocket = new SteroidsSocket({
                    target    : options.target,
                    port      : options.port,
                    transport : options.transport,
                    wsProto   : options.wsProto,
                    wsPath    : options.wsPath,
                    tlsType   : options.tlsType
                }),
                finalDelay, lastSent, totalCount; // by default we use delay
                        
            if (options.delay === 'async') {
                limit = 100; // low value to avoid problems (too much opened sockets, etc.)
                finalDelay = 0;
            } else {
                limit = 1;
                finalDelay = options.delay;
            }
            
            for (var i = minLen; i <= maxLen; i++) {
                initString += options.string;
                fuzzStrings.push(initString);
            }
            totalCount = fuzzStrings.length;
            
            printer.infoHigh('\nStarting ...\n');
            
            async.eachLimit(
                fuzzStrings,
                limit,
                function (fuzzString, asyncCb) {    
                    megaSocket.on('error', function (err) {
                        // The error is used to pass the last one (supposed to break the code)
                        asyncCb({
                            type : 'lastSent',
                            data : lastSent
                        });
                    });

                    megaSocket.on('message', function (msg) {
                        // TODO: Add param, string or buffer
                        lastAnswer = msg.data.toString();
                        printer.highlight('Response (index ' + indexCount +'): ');
            
                        // Last element
                        if (indexCount === totalCount ) {
                            asyncCb();
                        } else {
                            setTimeout(asyncCb, finalDelay);
                        }                        
                    });

                    // The message which is being sent
                    lastSent = fuzzString;
                    printer.infoHigh('Packet sent (index ' + indexCount +'): ');
                    printer.highlight(fuzzString);
                    megaSocket.send(fuzzString);
                    indexCount += 1;
                }, function (err) {
                    if (err) {
                        // Possible crash
                        callback(null,  {
                            answering : false,
                            lastSent  : err.data
                        });
                    } else {
                        callback(null,  { 
                            answering  : true,
                            lastAnswer : lastAnswer
                        });
                    }
                    // Only close when finished
                    megaSocket.close();
                }
            );
        }
	};
	
}());