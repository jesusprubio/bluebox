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

var JsFtp  = require('jsftp'),
    async  = require('async'),

    printer = require('../utils/printer');

module.exports = (function () {

    return {

        info : {
            name        : 'ftpBrute',
            description : 'Try to brute-force valid credentials for the FTP protocol',
            options     : {
                target : {
                    description  : 'IP address to brute-force',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port of the server',
                    defaultValue : 21,
                    type         : 'port'
                },
                users : {
                    description  : 'User (or file with them) to test',
                    defaultValue : 'anonymous',
                    type         : 'userPass'
                },
                passwords : {
                    description  : 'Password (or file with them) to test',
                    defaultValue : 'file:artifacts/dics/john.txt',
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
                    var jsFtp = new JsFtp({
                        host: options.target,
                        port: options.port,
                    });

                    function delayCb () {
                        // Last element
                        if (indexCountPass === finalPasswords.length &&
                            indexCountUsr === options.users.length) {
                            asyncCbPass();
                        } else {
                            setTimeout(asyncCbPass, options.delay);
                        }
                    }

                    indexCountPass += 1;

                    jsFtp.auth(user, password, function (err, data) {
                        // TODO: Destroy/close client, not supported by the module
                        if (err) {
                            if (/Login incorrect/.test(err)) {
                                printer.infoHigh('Valid credentials NOT found for: ' + user + ' | ' + password);
                                delayCb();
                            } else {
                                asyncCbPass(err);
                            }
                        } else {
                            result.push({
                                user : user,
                                pass : password
                            });
                            printer.highlight('Valid credentials found: ' + user + ' | ' + password);
                            delayCb();
                        }
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
