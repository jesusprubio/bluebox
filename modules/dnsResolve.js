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

var dns    = require('native-dns'),
    async  = require('async');


module.exports = (function () {
    
    return {
        
        info : {
            name        : 'dnsResolve',
            description : 'Resolve common VoIP DNS registers (SRV, NAPTR) for an specific domain',
            options     : {
                domain : {
                    description  : 'Domain to explore',
                    defaultValue : 'google.com',
                    type         : 'domain'
                },
                server : {
                    description  : 'DNS server to make the request on',
                    defaultValue : '87.216.170.85',
                    type         : 'targetIp'
                },
                timeout : {
                    description  : 'Time to wait for a response, in ms.',
                    defaultValue : 3000,
                    type         : 'positiveInt'
                }
            }
        },
                
        run : function (options, callback) {            
            var reqTypes = [
                    'SOA',
                    'A',
                    'AAAA',
                    'MX',
                    'TXT',
                    'SRV',
                    'NS',
                    'CNAME',
                    'PTR',
                    'NAPTR'
                ],
                result = [];           
            
            // We use limit to control Node.js powers
            // (avoid socket problems, etc.)
            async.eachLimit(reqTypes, 5, function (reqType, asyncCb) {
                var question = dns.Question({
                        name : options.domain,
                        type : reqType,
                    }),
                    req = dns.Request({
                        question : question,
                        server   : {
                            address : options.server,
                            port    : 53,
                            type    : 'udp'
                        },
                        timeout  : options.timeout
                    }),
                    res = [];

                req.on('timeout', function () {
                    asyncCb({
                        type : 'Timeout'
                    });
                });

                req.on('message', function (err, answer) {
                    if (answer.answer) {
                        res = answer.answer;
                    }
                });

                req.on('end', function () {
                    result.push({
                        type : reqType,
                        res  : res
                    });
                    asyncCb();
                });

                req.send();
            }, function (err) {
                callback(err, result);
            });
        }   
    };
    
}());