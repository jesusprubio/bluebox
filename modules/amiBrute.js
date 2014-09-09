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

    printer = require('../utils/printer'),
    utils   = require('../utils/utils');


module.exports = (function () {

    return {

        info : {
            name        : 'amiBrute',
            description : 'Try to brute-force valid credentials for the Asterisk Manager service (AMI)',
            options     : {
                target : {
                    description  : 'IP address to brute-force',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port of the server',
                    defaultValue : 5038,
                    type         : 'port'
                },
                users : {
                    description  : 'User (or file with them) to test',
                    defaultValue : 'guest',
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
                delay : {
                    description  : 'Delay between requests in ms.',
                    defaultValue : 0,
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
            var loginPairs  = utils.createLoginPairs(options.users, options.passwords, options.userAsPass),
                result      = [],
                indexCount  = 0, // User with delay to know in which index we are
                tmpUser;

            // We avoid to parallelize here to control the interval of the requests
            async.eachSeries(loginPairs, function (loginPair, asyncCb) {
                var connected = false,
                    valid     = false,
                    returned  = false,
                    ami;

                function delayCb () {
                    if (indexCount === loginPairs.length) {
                        asyncCb();
                    } else {
                        setTimeout(asyncCb, options.delay);
                    }
                }

                // The module do not supports connection timeout, so
                // we add it manually ("returned" var), really dirty trick
                setTimeout(function () {
                    if (!connected && !returned) {
                        returned = true;
                        callback({
                            type : 'timeout'
                        });
                    }
                    ami.disconnect();
                }, options.timeout);
                ami = new require('asterisk-manager')(
                    options.port.toString(), options.target,
                    loginPair.user, loginPair.pass,
                    true // determines whether events are emited
                );

                ami.on('managerevent', function (evt) {
                    if (evt.event === 'FullyBooted') {
                        valid = true;
                        ami.disconnect();
                        loginPair.privilege = evt.privilege;
                        result.push(loginPair);
                        printer.highlight('Valid credentials found: ' +
                                loginPair.user + ' | ' + loginPair.pass);
                    }
                    delayCb();
                });

                indexCount += 1;

                ami.on('end', function (msg) {
                    if (!valid) {
                        printer.infoHigh('Valid credentials NOT found for: ' +
                                    loginPair.user + ' | ' + loginPair.pass);
                        delayCb();
                    }
                });

                ami.on('connect', function () {
                    connected = true;
                });

                ami.on('error', function (err) {
                    // Onyl if not callbacked, look the comments above
                    if (!returned) {
                        returned = true;
                        asyncCb(err);
                    }
                });

            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
