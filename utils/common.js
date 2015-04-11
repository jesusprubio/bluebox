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


// Private stuff

var async = require('async'),
    request = require('request'),
    localIp = require('local-ip'),
    lodash = require('lodash'),
    blueTypes = require('./types');


// Public stuff

// Using the types subsystem to get the values needed by de modules
module.exports.parseOptions = function (passedOptions, expectedOptions, callback) {
    var finalOptions = {};

    // Module which doesn't need parameters
    if (!expectedOptions) {
        callback(null, null);

        return;
    }

    async.eachSeries(
        Object.keys(expectedOptions),
        function (option, cbSeries) {
            var passedValue = passedOptions[option],
                expectedOption = expectedOptions[option],
                finalValue;

            if (!blueTypes[expectedOption.type]) {
                cbSeries({
                    message: 'Type not found: ' + expectedOption.type,
                    error: null
                });

                return;
            }
            // If not defaultValue then the option is required
            if (passedValue && !expectedOption.defaultValue) {
                cbSeries({
                    message: 'Required option: ' + option,
                    error: null
                });

                return;
            }

            // The default value is always used if the option is not provided
            finalValue = passedValue || expectedOption.defaultValue;

            // Async params
            if (option === 'srcHost') {
                if (finalValue.slice(0, 6) === 'iface:') {
                    localIp(finalValue.slice(6), function (err, res) {
                        if (err) {
                            cbSeries({
                                message: 'Bad param: "' + option + '"',
//                                error: err
                                error: err.toString()
                            });

                            return;
                        }

                        finalOptions[option] = res;
                        cbSeries();
                    });
                } else if (finalValue === 'external') {
                    // TODO: Use the same lib than in the module
                    request.get({
                        uri: 'http://icanhazip.com/',
                        timeout: 5000,
                        json: false
                    }, function (err, r, body) {
                        if (err) {
                            cbSeries({
                                message: 'Bad param: "' + option + '"',
//                                error: err
                                error: err.toString()
                            });

                            return;
                        }

                        // Removing the ending '\n'
                        finalOptions[option] = body.substr(0, body.length - 1);
                        cbSeries();
                    });
                } else if (finalValue === 'random') {
                    // The parser ("types.js") will complete it
                    finalOptions[option] = null;
                    cbSeries();
                }
            } else {
                // Trying to get the final value for this parameter
                try {
                    finalOptions[option] = blueTypes[expectedOption.type](finalValue);
                } catch (err) {
                    cbSeries({
                        message: 'Bad parameter: ' + option,
                        error: err.toString()
                    });
                }

                // All fine, go to the next iteration
                cbSeries();
            }
        },
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, finalOptions);
            }
        }
    );
};

// Needed by the "autoVoip" module
module.exports.createAutoTargets = function (ips, customServices, sipTypes) {
    var targets = [];

    // Getting all combinations
    lodash.each(ips, function (target) {
        lodash.each(customServices, function (sipService) {
            // All requeqs which the server could answer at
            lodash.each(sipTypes, function (meth) {
                if (sipService.transport === 'WS' || sipService.transport === 'WSS') {
                    lodash.each(['', 'ws'], function (wsPath) {
                        targets.push({
                            ip: target,
                            port: sipService.port,
                            transport: sipService.transport,
                            meth: meth,
                            wsPath: wsPath
                        });
                    });
                } else {
                    targets.push({
                        ip: target,
                        port: sipService.port,
                        transport: sipService.transport,
                        meth: meth,
                    });
                }
            });
        });
    });

    return targets;
};
