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


module.exports = (function () {

    return {

        info : {
            name : 'sipBruteSlow',
            description : 'To check if the server is blocking slow brute-force attacks.',
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
                    defaultValue : 20000,
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
            var result      = {},
                limit       = 1,
                indexCount  = 0, // User with delay to know in which index we are
                finalDelay  = options.delay, // by default we use delay
                stackConfig = {
                    server    : options.target    || null,
                    port      : options.port      || '5060',
                    transport : options.transport || 'UDP',
                    timeout   : options.timeout   || 10000,
                    wsPath    : options.wsPath    || null,
                    tlsType   : options.tlsType   || 'SSLv3',
                    srcHost   : options.srcHost   || null,
                    lport     : options.srcPort   || null,
                    domain    : options.domain    || null
                };

            async.series([
                function(asyncCb){
                    printer.info('Checking if slow extension enumeration is being blocked ...\n');

                    async.eachSeries(
                        // Fake extensions, don't matter here
                        ['100', '101', '102', '103', '104', '105',
                         '106', '107', '108', '109', '110'],
                        function (extension, asyncCb1) {
                                var fakeStack = new SipFakeStack(stackConfig),
                                    msgConfig = {
                                        meth    : options.meth,
                                        fromExt : extension,
                                        // To force inf INVITE, OPTIONS, etc. (better results)
                                        toExt   : extension
                                    };

                            // TODO: We need to be more polited here, an ACK and BYE
                            // is needed to avoid loops
                            fakeStack.send(msgConfig, function (err, res) {
                                if (err) {
                                    printer.infoHigh('Not answering: ' + extension +
                                                      ' (' + options.meth + ')');
                                    asyncCb1(err);
                                } else {
                                    // but we print info about tested ones
                                    printer.highlight('Answering: ' + extension +
                                                     ' (' + options.meth + ')');
                                    setTimeout(asyncCb1, options.delay);
                                }
                            });
                        }, function (err) {
                            if (err) {
                                result.extensions = { vulnerable : false };
                            } else {
                                result.extensions = { vulnerable : true };
                            }
                            asyncCb();
                        });
                },
                function (asyncCb) {
                    // Fake passwords, don't matter here
                    var fakePasswords = lodash.times(10, function () { return lodash.random(1000, 9999); }),
                        finalPairs = [];
                    printer.info('\nChecking if slow password brute-force is being blocked ...\n');
                    lodash.each(fakePasswords, function (pass) {
                            finalPairs.push({
                                testExt : '100',
                                pass    : pass.toString()
                            });
                        }
                    );

                    async.eachSeries(
                        finalPairs,
                        function (finalPair, asyncCb1) {
                            var fakeStack = new SipFakeStack(stackConfig),
                                msgConfig = {
                                    meth    : options.meth,
                                    fromExt : finalPair.testExt,
                                    pass    : finalPair.pass
                                };

                                indexCount += 1;
                                fakeStack.authenticate(msgConfig, function (err, res) {
                                    if (err) {
                                        printer.infoHigh('Not answering: ' + finalPair.testExt + ' / ' +
                                                         msgConfig.pass  + ' (' + msgConfig.meth + ')');
                                        asyncCb1(err);
                                    } else {
                                    // but we print info about tested ones
                                        printer.highlight('Answering: ' + finalPair.testExt + ' / ' +
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
                                result.passwords = { vulnerable : false };
                            } else {
                                result.passwords = { vulnerable : true };
                            }
                            asyncCb();
                        }
                    );
                }
            ],
            // optional callback
            function(err, results){
                callback(err, result);
            });
        }
    };

}());
