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
    lodash  = require('lodash'),

    printer = require('../utils/printer'),
    utils   = require('../utils/utils');


module.exports = (function () {

    return {

        info : {
            name        : 'httpBruteDir',
            description : 'Try to brute-force valid files/directories in a web server',
            options     : {
                baseUri : {
                    description  : 'Base URI to brute-force',
                    defaultValue : 'http://127.0.0.1',
                    type         : 'anyValue'
                },
                paths : {
                    description  : 'Path (or file with them) to test',
                    defaultValue : 'file:artifacts/dics/http/voip.txt',
                    type         : 'userPass'
                },
                delay : {
                    description  : 'Delay between requests in ms. (async supported)',
                    defaultValue : 'async',
                    type         : 'delay'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var finalUris   = [],
                result      = [],
                indexCount  = 0, // User with delay to know in which index we are
                limit       = 1,
                tmpUser, finalDelay, baseUri;

            if (options.delay === 'async') {
                // low value to avoid problems (too much opened sockets, etc.)
                limit = 100;
                finalDelay = 0;
            } else {
                limit = 1;
                finalDelay = options.delay;
            }

            if (options.baseUri.substr(options.baseUri.length-1) === '/') {
                baseUri = options.baseUri.slice(0,-1);
            } else {
                baseUri = options.baseUri;
            }

            lodash.each(options.paths, function (path) {
                // to support different ports
                if (path.slice(0,1) === ':') {
                    finalUris.push(baseUri + path);
                } else {
                    finalUris.push(baseUri + '/' + path);
                }
            });

            // We avoid to parallelize here to control the interval of the requests
            async.eachLimit(finalUris, limit, function (finalUri, asyncCb) {
                // to avoid blocking
                var customHeaders = {
                        'User-Agent' : utils.customHttpAgent()
                    },
                    // It follows redirects by default (default: followRedirect = true)
                    cfg = {
                        uri       : finalUri,
                        method    : 'GET',
                        headers   : customHeaders,
                        json      : false,
                        timeout   : options.timeout,
                        strictSSL : false
                    };

                function delayCb () {
                    if (indexCount === finalUris.length) {
                        asyncCb();
                    } else {
                        setTimeout(asyncCb, finalDelay);
                    }
                }

                indexCount += 1;
                request.get(cfg, function (err, res, body) {
                    // TODO: Destroy/close client, not supported by the module
                    if (err) {
                        delayCb(err);
                    } else if (!err && res.statusCode !== 404) {
                        result.push({
                            path : finalUri,
                            code : res.statusCode,
                            body : res.body
                        });
                        printer.highlight('Valid path found: ' + finalUri);
                        delayCb();
                    } else {
                        printer.infoHigh('Valid path NOT found: ' + finalUri);
                        delayCb();
                    }
                });
            }, function (err) {
                callback(err, result);
            });
        }
    };

}());
