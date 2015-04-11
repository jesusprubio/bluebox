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
    printer = require('../utils/printer'),

    HELP = {
        description: 'SIP host/port scanner',
        options: {
            targets: {
                type: 'ips',
                description: 'Hosts to explore',
                defaultValue: '127.0.0.1'
                //defaultValue: '172.16.190.128'
            },
            // TODO: Coupled with the client
            // This order mandatory (between "transport" and "port" to try
            // to guess the porter when asking for the options
            transport: {
                type: 'transports',
                description: 'Underlying protocol',
                defaultValue: 'UDP'
            },
            ports: {
                type: 'ports',
                description: 'Ports to explore on chosen IPs',
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
                defaultValue: 'OPTIONS'
            },
            srcHost: {
                type: 'srcHost',
                description: 'Source host to include in the  SIP request ' +
                             '("external" and "random" supported)',
                defaultValue: 'iface:eth0'
                // defaultValue: 'iface:en0'
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


function getFingerPrint(msg) {
    var fingerprint, ser, ver;

    fingerprint = SipFakeStack.parser.server(msg) ||
                  SipFakeStack.sipParser.userAgent(msg) ||
                  SipFakeStack.parser.organization(msg);

    if (fingerprint) {
        ser = SipFakeStack.parser.service(fingerprint);
        ver = SipFakeStack.parser.version(fingerprint);
    }

    return {
        service: ser,
        version: ver
    };
}


// Public stuff

module.exports.help = HELP;

module.exports.run = function (options, callback) {
    var result = [],
        indexCountHost = 0, // User with delay to know in which index we are
        indexCountPort = 0,
        hasAuth = false;

    async.eachSeries(options.targets, function (target, asyncCbHost) {
        indexCountHost += 1;
        indexCountPort = 0;
        async.eachSeries(options.ports, function (port, asyncCbPort) {
            // We use a new stack in each request to simulate different users
            var stackConfig = {
                    server: target || null,
                    port: port || '5060',
                    transport: options.transport || 'UDP',
                    timeout: options.timeout || 10000,
                    wsPath: options.wsPath || null,
                    srcHost: options.srcHost || null,
                    lport: options.srcPort || null,
                    domain: options.domain || null
                },
                fakeStack = new SipFakeStack(stackConfig),
                msgConfig, finalMeth;

            if (options.meth === 'random') {
                finalMeth = SipFakeStack.utils.randSipReq();
            } else {
                finalMeth = options.meth;
            }

            msgConfig = {
                meth : finalMeth
            };

            indexCountPort += 1;
            fakeStack.send(msgConfig, function (err, res) {
                var msgString, parsedService, partialResult, finalRes;

                msgString = stackConfig.server + ':' + stackConfig.port + ' / ' +
                    stackConfig.transport;

                if (stackConfig.transport === 'WS' || stackConfig.transport === 'WSS') {
                    msgString += ' ( WS path: ' + stackConfig.wsPath + ')';
                }
                msgString += ' - ' + msgConfig.meth;

                // We don't want to stop the full chain (if error)
                if (!err) {
                    finalRes = res.data[0];

                    parsedService = getFingerPrint(finalRes);
                    if (['401', '407'].indexOf(SipFakeStack.parser.code(finalRes)) !== -1) {
                        hasAuth = true;
                    }
                    partialResult = {
                        host: stackConfig.server,
                        port: stackConfig.port,
                        transport: stackConfig.transport,
                        meth: msgConfig.meth,
                        auth: hasAuth,
                        data: finalRes
                    };

                    if (parsedService) {
                        partialResult.service = parsedService.service;
                        partialResult.version = parsedService.version;
                    }

                    result.push(partialResult);
                    printer.highlight('Response received: ' + msgString);
                } else {
                    printer.infoHigh('Response NOT received: ' + msgString);
                }

                // Last element
                if (indexCountHost === options.targets.length &&
                    indexCountPort === options.ports.length) {
                    asyncCbPort();
                } else {
                    setTimeout(asyncCbPort, options.delay);
                }
            });
        }, function (err) {
            asyncCbHost(err);
        });
    }, function (err) {
        callback(err, result);
    });
};

