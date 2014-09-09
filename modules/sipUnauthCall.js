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
    lodash = require('lodash'),

    SipFakeStack = require('../utils/sipFakeStack'),
    sipParser    = require('../utils/sipParser'),
    printer      = require('../utils/printer');


module.exports = (function () {

    var user = '100',
        pass = '100';

    return {

        info : {
            name : 'sipUnauthCall',
            description : 'To check if a server allows unauthenticated calls',
            options : {
                target : {
                    description  : 'IP address to attack',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port to use',
                    defaultValue : 5060,
                    type         : 'port'
                },
                transport : {
                    description  : 'Underlying protocol',
                    defaultValue : 'UDP',
                    type         : 'protocols'
                },
                tlsType : {
                    description  : 'Version of TLS protocol to use (only when TLS)',
                    defaultValue : 'SSLv3',
                    type         : 'tlsType'
                },
                wsPath : {
                    description  : 'Websockets path (only when websockets)',
                    defaultValue : 'ws',
                    type         : 'anyValue'
                },
                fromExt : {
                    description  : 'Extension which makes the call',
                    defaultValue : 'range:100-110',
                    type         : 'userPass'
                },
                toExt : {
                    description  : 'Extension which receives the call',
                    defaultValue : 'range:100-110',
                    type         : 'userPass'
                },
                srcHost : {
                    description  : 'Source host to include in the  SIP request',
                    defaultValue : 'random',
                    type         : 'targetIpRand'
                },
                srcPort : {
                    description  : 'Source port to include in the  SIP request',
                    defaultValue : 'random',
                    type         : 'portRand'
                },
                domain : {
                    description  : 'Domain to explore ("ip" to use the target)',
                    defaultValue : 'ip',
                    type         : 'domainIp'
                },
                delay : {
                    description  : 'Delay between requests in ms.',
                    defaultValue : 0,
                    type         : 'positiveInt'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var extPairs    = [],
                result      = [],
                indexCount  = 0, // User with delay to know in which index we are
                stackConfig = {
                    server    : options.target    || null,
                    port      : options.port      || '5060',
                    transport : options.transport || 'UDP',
                    timeout   : options.timeout   || 10000,
                    wsPath    : options.wsPath    || null,
                    tlsType   : options.tlsType   || 'SSLv3',
                    srcHost   : options.srcHost   || null,
                    lport     : options.srcPort   || null,
                    domain    : options.domain    || null
                };

            lodash.each(options.fromExt, function (fromExt) {
                lodash.each(options.toExt, function (toExt) {
                    extPairs.push({
                        fromExt : fromExt,
                        toExt   : toExt
                    });
                });
            });

            async.eachSeries(
                extPairs,
                function (extPair, asyncCb) {
                    // We use a new stack in each request to simulate different users
                    var msgConfig = {
                            meth    : 'INVITE',
                            fromExt : extPair.fromExt,
                            toExt   : extPair.toExt
                        },
                        fakeStack;

                    indexCount += 1;
                    fakeStack = new SipFakeStack(stackConfig);

                    // TODO: We need to be more polited here, an ACK and BYE
                    // is needed to avoid loops
                    fakeStack.send(msgConfig, function (err, res) {
                        var hasAuth       = true,
                            partialResult = {};

                        if (!err) {
                            var finalRes  = res.msg,
                                resCode   = sipParser.code(finalRes),
                                finalInfo = null;

                            if(['401', '407'].indexOf(resCode) !== -1) {
                                finalInfo = 'Auth enabled, not accepted';
                            } else if(resCode === '100') {
                                finalInfo = 'Accepted';
                            } else {
                                finalInfo = 'Auth disable, but not accepted, code: ' + resCode;
                            }

                            // We only add valid extensions to final result
                            if (finalInfo === 'Accepted') {
                                partialResult = {
                                    fromExt : extPair.fromExt,
                                    toExt   : extPair.toExt,
                                    info    : finalInfo,
                                    data    : res.msg
                                };
                                result.push(partialResult);
                                printer.highlight('Accepted: ' + extPair.fromExt + ' => ' + extPair.toExt );
                            } else {
                            // but we print info about tested ones
                                printer.infoHigh(finalInfo + ': ' + extPair.fromExt + ' => ' + extPair.toExt );
                            }
                            // Last element
                            if (indexCount === extPairs.length ) {
                                asyncCb();
                            } else {
                                setTimeout(asyncCb, options.delay);
                            }
                        } else {
                            // We want to stop the full chain
                            asyncCb(err);
                        }
                    });
                }, function (err) {
                    callback(err, result);
                }
            );
        }
    };

}());
