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

var SipFakeStack = require('../utils/sipFakeStack'),
    sipParser    = require('../utils/sipParser'),
    printer      = require('../utils/printer'),
    utils        = require('../utils/utils');

// http://www.cs.columbia.edu/~dgen/papers/conferences/conference-02.pdf
module.exports = (function () {

    return {

        info : {
            name        : 'sipSQLi',
            description : 'To check if the server blocks SIP SQLi attacks',
            options     : {
                target : {
                    description  : 'IP address to brute-force',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port of the server',
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
                timeout : {
                    description  : 'Time to wait for the first response, in ms.',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                },
            }
        },

        run : function (options, callback) {
            var result      = {},
                fakeRealm = options.domain || options.target,
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
                },
                fakeStack = new SipFakeStack(stackConfig),
                msgConfig = {
                    meth    : 'INVITE',
                    fromExt : '100',
                    pass    : 'ola',
                    sqli    : true
                };

                fakeStack.authenticate(msgConfig, function (err, res) {
                    if (err) {
                        if (err.second) {
                            callback(null, {
                                vulnerable : 'no',
                                data       : 'Blocked'
                            });
                        } else {
                            callback(err);
                        }
                    } else {
                        if (/User without authentication/.test(res.message)) {
                            callback(null, {
                                vulnerable : 'unknown, no auth'
                            });
                        } else {
                            if (['407', '401'].indexOf(sipParser.code(res.data)) === -1) {
                                callback(null, {
                                    vulnerable : 'no',
                                    data       : res.data
                                });
                            } else {
                                callback(null, {
                                    vulnerable : 'maybe',
                                    data       : res.data
                                });
                            }
                        }
                    }
                }
            );
        }
    };

}());
