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
    lodash = require('lodash'),
    SipFakeStack = require('sip-fake-stack'),
    logger = require('../utils/logger'),

    HELP = {
        description: 'To check if the server is blocking slow brute-force attacks',
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
                defaultValue: 'REGISTER'
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
            extensions: {
                type: 'userPass',
                description: 'User (or file with them) to test',
                defaultValue: 'range:100-110'
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
    var result = {},
        indexCount = 0, // User with delay to know in which index we are
        stackConfig = {
            server: options.target || null,
            port: options.port || '5060',
            transport: options.transport || 'UDP',
            timeout: options.timeout || 10000,
            wsPath: options.wsPath || null,
            srcHost: options.srcHost || null,
            lport: options.srcPort || null,
            domain: options.domain || null
        };

    async.series([
        function (asyncCb) {
            logger.info('Checking if slow extension enumeration is being blocked ...\n');

            async.eachSeries(
                // Fake extensions, don't matter here
                options.extensions,
                function (extension, asyncCb1) {
                    var fakeStack = new SipFakeStack(stackConfig),
                        msgConfig = {
                            meth: options.meth,
                            fromExt: extension,
                            // To force inf INVITE, OPTIONS, etc. (better results)
                            toExt: extension
                        };

                    // TODO: We need to be more polited here, an ACK and BYE
                    // is needed to avoid loops
                    fakeStack.send(msgConfig, function (err) {
                        if (err) {
                            logger.infoHigh('Not answering: ' + extension + ' (' + options.meth + ')');
                            asyncCb1(err);
                        } else {
                            // but we print info about tested ones
                            logger.highlight('Answering: ' + extension + ' (' + options.meth + ')');
                            setTimeout(asyncCb1, options.delay);
                        }
                    });
                }, function (err) {
                    if (err) {
                        result.extensions = { vulnerable : false };
                    } else {
                        result.extensions = { vulnerable : true };
                    }
                    asyncCb();
                });
        },
        function (asyncCb) {
            // Fake passwords, don't matter here
            var fakePasswords = lodash.times(
                    options.extensions.length,
                    function () {
                        return lodash.random(1000, 9999);
                    }
                ),
                finalPairs = [];
            logger.info('\nChecking if slow password brute-force is being blocked ...\n');
            lodash.each(fakePasswords, function (pass) {
                finalPairs.push({
                    testExt : '100',
                    pass    : pass.toString()
                });
            });

            async.eachSeries(
                finalPairs,
                function (finalPair, asyncCb1) {
                    var fakeStack = new SipFakeStack(stackConfig),
                        msgConfig = {
                            meth: options.meth,
                            fromExt: finalPair.testExt,
                            pass: finalPair.pass
                        };

                    indexCount += 1;
                    fakeStack.authenticate(msgConfig, function (err) {
                        if (err) {
                            logger.infoHigh('Not answering: ' + finalPair.testExt + ' / ' +
                                             msgConfig.pass  + ' (' + msgConfig.meth + ')');
                            asyncCb1(err);
                        } else { // but we print info about tested ones
                            logger.highlight('Answering: ' + finalPair.testExt + ' / ' +
                                              finalPair.pass  + ' (' + msgConfig.meth + ')');
                            // Last element
                            if (indexCount === finalPairs.length) {
                                asyncCb1();
                            } else {
                                setTimeout(asyncCb1, options.delay);
                            }
                        }
                    });
                }, function (err) {
                    if (err) {
                        result.passwords = {
                            vulnerable: false
                        };
                    } else {
                        result.passwords = {
                            vulnerable: true
                        };
                    }
                    asyncCb();
                }
            );
        }
    ],
    // optional callback
    function (err) {
        callback(err, result);
    });
};
