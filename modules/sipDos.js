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
    printer      = require('../utils/printer'),
    utils        = require('../utils/utils');


// Module core
module.exports = (function () {

    return {

        info : {
            name : 'sipDos',
            description : 'DoS protection mechanisms stress test (it waits for a response)',
            options     : {
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
                meth : {
                    description  : 'Type of SIP packets to do the requests ("random" available)',
                    defaultValue : 'INVITE',
                    type         : 'sipRequests'
                },
                numReq : {
                    description  : 'Number of requests to send',
                    defaultValue : 500,
                    type         : 'positiveInt'
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
            var fakeIndex     = [],
                limit         = 1,
                indexCount    = 0, // User with delay to know in which index we are
                lastAnswer    = null,
                finalDelay; // by default we use delay

            if (options.delay === 'async') {
                limit = 100; // low value to avoid problems (too much opened sockets, etc.)
                finalDelay = 0;
            } else {
                limit = 1;
                finalDelay = options.delay;
            }

            // Dirty trick to control async
            fakeIndex = new Array(options.numReq).join(1).split('');
            async.eachLimit(
                fakeIndex,
                limit,
                function (hostPortPair, asyncCb) {
                    // We use a new stack in each request to simulate different users
                    var stackConfig = {
                            server    : options.target    || null,
                            port      : options.port      || '5060',
                            transport : options.transport || 'UDP',
                            timeout   : options.timeout   || 10000,
                            wsPath    : options.wsPath    || null,
                            tlsType   : options.tlsType   || 'SSLv3',
                            srcHost   : options.srcHost   || null,
                            lport     : options.srcPort   || null,
                            domain    : options.domain    || null
                        },
                        fakeStack = new SipFakeStack(stackConfig),
                        msgConfig, finalMeth;

                    indexCount += 1;

                    if (options.meth === 'random') {
                        finalMeth = utils.randSipReq();
                    } else {
                        finalMeth = options.meth;
                    }
                    msgConfig = { meth : finalMeth };

                    fakeStack.send(msgConfig, function (err, res) {
                        var finalRes;

                        // We don't want to stop the full chain (if error)
                        if (!err) {
                            lastAnswer = res.msg;
                            printer.highlight('Response (index ' + indexCount +'): ');
                        } else {
                            lastAnswer = null;
                            printer.infoHigh('Response not received (index ' + indexCount +')');
                        }

                        // Last element
                        if (indexCount === options.numReq) {
                            asyncCb();
                        } else {
                            setTimeout(asyncCb, finalDelay);
                        }
                    });
                }, function (err) {
                    callback(err, {
                        online     : lastAnswer ? true: false,
                        lastAnswer : lastAnswer
                    });
                }
            );
        }
    };

}());
