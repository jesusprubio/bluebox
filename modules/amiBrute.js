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
                    var returned  = false,
                        ami;

                    function delayCb () {
                        // Last element
                        if (indexCountPass === finalPasswords.length && indexCountUsr === options.users.length) {
                            asyncCbPass();
                        } else {
                            setTimeout(asyncCbPass, options.delay);
                        }
                    }

                    ami = new require('asterisk-manager')( options.port.toString(), options.target, user, password, true);
                    indexCountPass += 1;

                    ami.on('connect', function () {
                        ami.action({
                            'action'   : 'login',
                            'username' : user,
                            'secret'   : password
                        }, function (err, res) {
                            if (!err) {
                                ami.disconnect();
                                result.push({
                                    user      : user,
                                    pass      : password
                                });
                                printer.highlight('Valid credentials found: ' + user + ' | ' + password);
                            }
                            delayCb();
                        });

                    });

                    ami.on('error', function (err) {
                        if (err.toString().indexOf('ECONNRESET') > -1) {
                            printer.infoHigh('Valid credentials NOT found for: ' + user + ' | ' + password);
                        } else {
                            // Onyl if not connected or callbacked, look the comments above                            
                            if (!returned) {
                                returned = true;
                                asyncCbPass({ err : err });
                            }
                        }
                        delayCb();
                    });
                }, function (err) {
                    asyncCbUsr(err);
                });
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
