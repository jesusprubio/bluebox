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

var mongo  = require('mongodb'),
    async  = require('async'),

    printer = require('../utils/printer'),
    utils   = require('../utils/utils');


module.exports = (function () {

    return {

        info : {
            name        : 'bruteMongo',
            description : 'MongoDB credentials brute-force',
            options     : {
                target : {
                    description  : 'IP address to brute-force',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port of the server',
                    defaultValue : 27017,
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
                    description  : 'Time to wait for the first response, in ms.',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var client      = mongo.MongoClient,
                loginPairs  = utils.createLoginPairs(options.users, options.passwords, options.userAsPass),
                result      = [],
                indexCount  = 0, // User with delay to know in which index we are
                tmpUser;

            // We avoid to parallelize here to control the interval of the requests
            async.eachSeries(loginPairs, function (loginPair, asyncCb) {
                indexCount += 1;
                client.connect(
                    'mongodb://' + loginPair.user + ':' + loginPair.pass + '@' +
                    options.target + ':' + options.port.toString() +
                    '/admin?autoReconnect=false&connectTimeoutMS=' + options.timeout,
                    // By default the client tries 5 times
                    {
                        numberOfRetries  : 0,
                        retryMiliSeconds : 0 // Just in case
                    },
                    function(err, res) {
                        // TODO: Destroy/close client, not supported by the module
                        if (err) {
                            // Only in this case we want to stop the chain
                            if (/timed out/.exec(err)) {
                                asyncCb({
                                    type : 'Timeout'
                                });
                            // Strange users/passwords sometimes users invalid chars
                            // so we are neither callbacking the error here
                            } else  {
                                printer.infoHigh('Valid credentials NOT found for: ' +
                                        loginPair.user + ' | ' + loginPair.pass);
                                if (!(/auth failed/.exec(err))) {
                                    printer.infoHigh(err);
                                }
                            }
                        } else {
                            loginPair.res = res;
                            result.push(loginPair);
                            printer.highlight('Valid credentials found: ' +
                                        loginPair.user + ' | ' + loginPair.pass);
                        }

                        // Last element
                        if (indexCount === loginPairs.length) {
                            asyncCb();
                        } else {
                            setTimeout(asyncCb, options.delay);
                        }
                    }
                );
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
