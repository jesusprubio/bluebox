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
                    defaultValue : 'anonymous',
                    type         : 'userPass'
                },
                passwords : {
                    description  : 'Password (or file with them) to test',
                    defaultValue : 'anonymous',
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
                var authCfg = {
                        user            : loginPair.user,
                        pass            : loginPair.pass,
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
                    if (indexCount === loginPairs.length) {
                        asyncCb();
                    } else {
                        setTimeout(asyncCb, options.delay);
                    }
                }

                indexCount += 1;
                request.get(cfg, function (err, res, body) {
                    // TODO: Destroy/close client, not supported by the module
                    if (!err && res.statusCode === 200) {
                        result.push(loginPair);
                        printer.highlight('Valid credentials found: ' +
                                    loginPair.user + ' | ' + loginPair.pass);
                        delayCb();

                        //                        if ( {
                    } else if ( !err && /Authorization Required/.test(body)) {
                            printer.infoHigh('Valid credentials NOT found for: ' +
                                            loginPair.user + ' | ' + loginPair.pass);
                            delayCb();
                    } else {
                        asyncCb(err);
                    }
                });
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
