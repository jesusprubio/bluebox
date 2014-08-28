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
    lodash = require('lodash'),
    util   = require('util'),
    
    printer = require('../utils/printer'),
    utils   = require('../utils/utils');


module.exports = (function () {
    
    return {
        info : {
            name        : 'bruteMongo',
            description : 'MongoDB credentials brute-force',
            options     : {
                targets : {
                    description  : 'IP address to explore',
                    defaultValue : '127.0.0.1',
                    type         : 'targets'
                },
                ports : {
                    description  : 'Ports to test in each server',
                    defaultValue : '27017',
                    type         : 'ports'
                },
                limit : {
                    description  : 'Max number of request to run in parallel',
                    defaultValue : 50,
                    type         : 'positiveInt'
                },
                delay : {
                    description  : 'Delay between requests in ms. ("async" to concurrent)',
                    defaultValue : 0,
                    type         : 'delay'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                }                
            }
        },
                
        run : function (options, callback) {
            var self          = this,
                client        = mongo.MongoClient,
                hostPortPairs = utils.createTargetPairs(options.targets, options.ports),
                result        = [],
                partialResult = {},
                limit         = 1,
                indexCount    = 0, // User with delay to know in which index we are
                tmpTarget;
                        
            async.eachLimit(
                hostPortPairs,
                options.limit,
                function (hostPortPair, asyncCb) {
                    var connected  = false;
                    
                    indexCount += 1;
                    client.connect(
                        // http://docs.mongodb.org/manual/reference/connection-string
                        'mongodb://' + hostPortPair.target + ':' + hostPortPair.port +
                        '/admin?autoReconnect=false&connectTimeoutMS=' + options.timeout,
                        // By default the client tries 5 times
                        {
                            numberOfRetries  : 0,
                            retryMiliSeconds : 0 // Just in case
                        },
                        function (err, db) {
                            if (err) {
                                printer.infoHigh('Host not found: ' + hostPortPair.target +
                                                  ':' + hostPortPair.port);
                                // We don't callback the error to avoid stopping the chain
                            } else {
                                connected = true;
                                printer.highlight('Host found: ' + hostPortPair.target + ':' + hostPortPair.port);
                                partialResult = {
                                    host : hostPortPair.target,
                                    port : hostPortPair.port,
                                    data : util.inspect(db, { showHidden : true,
                                                              depth      : 2})
                                };
                                db.collections(function(err, collections) {
                                    if (!err) {
                                        partialResult.auth = false;
                                    } else if (/not authorized/.exec(err)) {
                                        partialResult.auth = true;
                                    } else {
                                        partialResult.authError = err;
                                    }
                                    result.push(partialResult);
                                    db.close();
                                });
                            }
                            // Last element
                            if (indexCount === hostPortPairs.length) {
                                asyncCb();
                            } else {
                                setTimeout(asyncCb, options.delay);
                            }                            
                        }
                    );
                }, function (err) {
                    callback(err, result);
                }
            );
        }
	};
	
}());