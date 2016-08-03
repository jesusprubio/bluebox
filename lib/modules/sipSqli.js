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

var SipFakeStack = require('sip-fake-stack'),

    // TODO: IPv6, https://tools.ietf.org/rfc/rfc5118.txt
    HELP = {
        description: 'To check if the server blocks SIP SQLi attacks',
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
        msgConfig = {
            meth: 'INVITE',
            fromExt: '100',
            pass: 'ola',
            sqli: true
        };

    fakeStack.authenticate(msgConfig, function (err, res) {
        if (err) {
            if (err.second) {
                callback(null, {
                    vulnerable: 'no',
                    data: 'Blocked'
                });
            } else {
                callback(err);
            }
        } else {
            if (/User without authentication/.test(res.data.response)) {
                callback(null, {
                    vulnerable: 'unknown, no auth',
                    data: res.data
                });

                return;
            }
            if (['407', '401'].indexOf(SipFakeStack.parser.code(res.data.response) === -1)) {
                callback(null, {
                    vulnerable: 'no',
                    data: res.data
                });
            } else {
                callback(null, {
                    vulnerable: 'maybe',
                    data: res.data
                });
            }
        }
    });
};
