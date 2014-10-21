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

var request = require('request'),
    async   = require('async'),

    printer = require('../utils/printer'),
    utils   = require('../utils/utils');


module.exports = (function () {

    return {

        info : {
            name        : 'httpBrute',
            description : 'Try to brute-force valid credentials for the HTTP protocol',
            options     : {
                uri : {
                    description  : 'URI to brute-force',
                    defaultValue : 'http://127.0.0.1',
                    type         : 'anyValue'
                },
                users : {
                    description  : 'User (or file with them) to test',
                    defaultValue : 'file:artifacts/dics/john.txt',
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
                    var authCfg = {
                            user            : user,
                            pass            : password,
                            sendImmediately : false
                        },
                        // to avoid blocking
                        customHeaders = {
                            'User-Agent' :  utils.customHttpAgent()
                        },
                        cfg = {
                            uri       : options.uri,
                            method    : 'GET',
                            headers   : customHeaders,
                            json      : false,
                            timeout   : options.timeout,
                            strictSSL : false,
                            auth      : authCfg
                        };

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
                    request.get(cfg, function (err, res, body) {
                        // TODO: Destroy/close client, not supported by the module
                        if (!err && res.statusCode === 200) {
                            result.push({
                                user : user,
                                pass : password
                            });
                            printer.highlight('Valid credentials found: ' + user + ' | ' + password);
                            delayCb();
                        } else if ( !err && /Authorization Required/.test(body)) {
                            printer.infoHigh('Valid credentials NOT found for: ' + user + ' | ' + password);
                            delayCb();
                        } else {
                            asyncCbPass(err);
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
