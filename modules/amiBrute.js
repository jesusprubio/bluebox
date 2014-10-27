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

var async   = require('async'),
    namiLib = require('nami'),
    Nami    = namiLib.Nami,

    printer = require('../utils/printer');


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
                    defaultValue : 'admin',
                    type         : 'userPass'
                },
                passwords : {
                    description  : 'Password (or file with them) to test',
                    defaultValue : 'amp111',
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
            var result         = [],
                indexCountUsr  = 0, // Used with delay to know in which index we are
                indexCountPass = 0;

            // We avoid to parallelize here to control the interval of the requests
            async.eachSeries(options.users, function (user, asyncCbUsr) {
                var finalPasswords = [];

                finalPasswords = finalPasswords.concat(options.passwords);
                indexCountUsr += 1;
                indexCountPass = 0;
                if (options.userAsPass) {
                    finalPasswords.push(user);
                }

                async.eachSeries(finalPasswords, function (password, asyncCbPass) {
                    var connected = false,
                        ami;

                    function delayCb () {
                        if (connected) { ami.close(); }
                        // Last element
                        if (indexCountPass === finalPasswords.length && indexCountUsr === options.users.length) {
                            asyncCbPass();
                        } else {
                            setTimeout(asyncCbPass, options.delay);
                        }
                    }

                    // http://ci.marcelog.name:8080/view/NodeJS/job/Nami/javadoc/index.html
                    ami = new Nami({
                        host     : options.target,
                        port     : options.port,
                        username : user,
                        secret   : password
                    });

                    ami.logger.setLevel('OFF');

                    ami.on('namiConnected', function () {
                        connected = true;
                        printer.highlight('Valid credentials found: ' + user + ' | ' + password);
                        result.push({
                            user : user,
                            pass : password
                        });
                        delayCb();
                    });

                    ami.on('namiLoginIncorrect', function () {
                        printer.infoHigh('Valid credentials NOT found for: ' + user + ' | ' + password);
                        delayCb();
                    });

                    // The module do not supports connection timeout, so
                    // we add it manually ("connected" var), really dirty trick
                    setTimeout(function () {
                        if (!connected) {
                            callback({
                                type : 'timeout'
                            });
                        }
                    }, options.timeout);
                    indexCountPass += 1;
                    ami.open();
                }, function (err) {
                    asyncCbUsr(err);
                });
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
