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


// Private stuff

var async  = require('async'),
    SipFakeStack = require('sip-fake-stack'),
    logger = require('../utils/logger'),

    HELP = {
        description: 'DoS protection mechanisms stress test ' +
                     '(it waits for a response)',
        options: {
            target: {
                type: 'ip',
                description: 'Host to attack',
                defaultValue: '127.0.0.1'
            },
            // TODO: Coupled with the client
            // This order mandatory (between "transport" and "port" to try
            // to guess the porter when asking for the options
            transport: {
                type: 'transports',
                description: 'Underlying protocol',
                defaultValue: 'UDP'
            },
            port: {
                type: 'port',
                description: 'Port to attack on chosen IPs',
                defaultValue: 5060
            },
            wsPath: {
                type: 'allValid',
                description: 'Websockets path (only when websockets)',
                defaultValue: 'ws'
            },
            meth: {
                type: 'sipRequests',
                description: 'Type of SIP packets to do the requests ("random" available)',
                defaultValue: 'INVITE'
            },
            numReq: {
                type: 'positiveInt',
                description: 'Number of requests to send',
                defaultValue: 500
            },
            srcHost: {
                type: 'srcHost',
                description: 'Source host to include in the  SIP request ' +
                             '("external" and "random" supported)',
                defaultValue: 'iface:eth0'
            },
            srcPort: {
                type: 'srcPort',
                description: 'Source port to include in the  SIP request ("random" supported)',
                defaultValue: 'real'
            },
            domain: {
                type: 'domainIp',
                description: 'Domain to explore ("ip" to use the target)',
                defaultValue: 'ip'
            },
            delay: {
                type: 'positiveInt',
                description: 'Delay between requests, in ms.',
                defaultValue: 0
            },
            timeout: {
                type: 'positiveInt',
                description: 'Time to wait for a response, in ms.',
                defaultValue: 5000
            }
        }
    };


// Public stuff

module.exports.help = HELP;

module.exports.run = function (options, callback) {
    var fakeIndex = [],
        blocking = false,
        indexCount = 0; // User with delay to know in which index we are

    // TODO: Dirty trick to control async
    fakeIndex = new Array(options.numReq).join(1).split('');
    async.eachSeries(
        fakeIndex,
        function (hostPortPair, asyncCb) {
            // We use a new stack in each request to simulate different users
            var stackConfig = {
                    server: options.target || null,
                    port: options.port || '5060',
                    transport: options.transport || 'UDP',
                    timeout: options.timeout || 10000,
                    wsPath: options.wsPath || null,
                    srcHost: options.srcHost || null,
                    lport: options.srcPort || null,
                    domain: options.domain || null
                },
                fakeStack = new SipFakeStack(stackConfig),
                msgConfig, finalMeth, lastIndex;

            indexCount += 1;

            if (options.meth === 'random') {
                finalMeth = SipFakeStack.utils.randSipReq();
            } else {
                finalMeth = options.meth;
            }
            msgConfig = {
                meth: finalMeth
            };

            fakeStack.send(msgConfig, function (err) {
                // We don't want to stop the full chain (if error)
                if (!err) {
                    logger.highlight('Response received (index ' + indexCount + ')');
                    lastIndex = indexCount;
                } else {
                    logger.infoHigh('Response not received (index ' + indexCount + ')');
                }

                // Last element
                if (indexCount === options.numReq) {
                    if (err) {
                        blocking = true;
                    }
                    asyncCb();
                } else {
                    setTimeout(asyncCb, options.delay);
                }
            });
        }, function (err) {
            callback(err, {
                blocking: blocking,
                indexCount: indexCount
            });
        }
    );
};
