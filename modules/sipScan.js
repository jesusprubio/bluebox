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
    printer      = require('../utils/printer'),
    utils        = require('../utils/utils');


// Private helpers

function getFingerPrint (msg) {
    var fingerprint, ser, ver;

    fingerprint = sipParser.server(msg) || sipParser.userAgent(msg) ||
                  sipParser.organization(msg);

    if (fingerprint) {
        ser = sipParser.service(fingerprint);
        ver = sipParser.version(fingerprint);
    }

    return {
        service: ser,
        version: ver
    };
}


// Module core
module.exports = (function () {

    return {

        info : {
            name : 'sipScan',
            description : 'SIP host/port scanner',
            options     : {
                targets : {
                    description  : 'IP address to explore',
                    defaultValue : '127.0.0.1',
                    type         : 'targets'
                },
                ports : {
                    description  : 'Ports to test in each server',
                    defaultValue : 5060,
                    type         : 'ports'
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
                    defaultValue : 'OPTIONS',
                    type         : 'sipRequests'
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
                    description  : 'Delay between requests in ms. ("async" to concurrent)',
                    defaultValue : 0,
                    type         : 'delay'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 3000,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var hostPortPairs = utils.createTargetPairs(options.targets, options.ports),
                result        = [],
                limit         = 1,
                indexCount    = 0, // User with delay to know in which index we are
                hasAuth       = false,
                finalDelay; // by default we use delay

            if (options.delay === 'async') {
                limit = 10; // low value to avoid problems (too much opened sockets, etc.)
                finalDelay = 0;
            } else {
                limit = 1;
                finalDelay = options.delay;
            }
            async.eachLimit(
                hostPortPairs,
                limit,
                function (hostPortPair, asyncCb) {
                    // We use a new stack in each request to simulate different users
                    var stackConfig = {
                            server    : hostPortPair.target || null,
                            port      : hostPortPair.port   || '5060',
                            transport : options.transport   || 'UDP',
                            timeout   : options.timeout     || 10000,
                            wsPath    : options.wsPath      || null,
                            tlsType   : options.tlsType     || 'SSLv3',
                            srcHost   : options.srcHost     || null,
                            lport     : options.srcPort     || null,
                            domain    : options.domain      || null
                        },
                        fakeStack = new SipFakeStack(stackConfig),
                        msgConfig, finalMeth, finalSrcHost, finalSrcPort;

                    if (options.meth === 'random') {
                        finalMeth = utils.randSipReq();
                    } else {
                        finalMeth = options.meth;
                    }

                    msgConfig = {
                        meth : finalMeth
                    };

                    indexCount += 1;
                    fakeStack.send(msgConfig, function (err, res) {
                        var msgString, parsedService, partialResult, finalRes;

                        msgString = stackConfig.server + ':' + stackConfig.port + ' / ' +
                            stackConfig.transport;

                        if (stackConfig.transport === 'TLS') {
                            msgString += ' (' + stackConfig.tlsType + ')';
                        }
                        msgString += ' - ' + msgConfig.meth;

                        // We don't want to stop the full chain (if error)
                        if (!err) {
                            finalRes = res.msg;

                            parsedService = getFingerPrint(finalRes);
                            if (['401', '407'].indexOf(sipParser.code(finalRes)) !== -1) {
                                hasAuth = true;
                            }
                            partialResult = {
                                host       : stackConfig.server,
                                port       : stackConfig.port,
                                transport  : stackConfig.transport,
                                meth       : msgConfig.meth,
                                auth       : hasAuth,
                                service    : parsedService.service,
                                version    : parsedService.version,
                                data       : finalRes
                            };

                            result.push(partialResult);
                            printer.highlight('Response received: ' + msgString);
                        } else {
                            printer.infoHigh('Response NOT received: ' + msgString);
                        }

                        // Last element
                        if (indexCount === hostPortPairs.length ) {
                            asyncCb();
                        } else {
                            setTimeout(asyncCb, finalDelay);
                        }
                    });
                }, function (err) {
                    callback(err, result);
                }
            );
        }
    };

}());
