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

var async        = require('async'),
    requireDir   = require('require-directory'),

    blueTypes    = require('./utils/blueTypes');


// Constructor

function Bluebox (options) {
    this.shodanKey = options.shodanKey;

    this.modulesInfo  = requireDir(module, './modules');
}


// Helpers


// Public functions

Bluebox.prototype.getModulesInfo = function () {
    return this.modulesInfo;
};

Bluebox.prototype.runModule = function (moduleName, config, callback) {
    var finalConfig = {},
        moduleInfo, blueModule;

    if (this.modulesInfo[moduleName]) {
        moduleInfo = this.modulesInfo[moduleName].info;
        blueModule = require('./modules/' + moduleName);

        if (moduleName.substr(0, 6) === 'shodan') {
            finalConfig.shodanKey = this.shodanKey;
        }

        if (moduleInfo.options) {
            async.eachSeries(
                Object.keys(moduleInfo.options),
                function (option, callback) {
                    var optionValue = moduleInfo.options[option];

                    if (blueTypes[optionValue.type]) {
                        if ( config[option] || optionValue.defaultValue ||
                            optionValue.defaultValue === 0) {
                                try {
                                    if (!config[option]) {
                                        // Default value always used if the option
                                        // is not provided
                                        finalConfig[option] = blueTypes[optionValue.type](optionValue.defaultValue);
                                    } else {
                                        finalConfig[option] = blueTypes[optionValue.type](config[option]);
                                    }
                                    callback();
                                } catch (e) {
                                    callback({
                                        type : 'Bad param',
                                        info : option,
                                        hint : e.toString()
                                    });
                                }
                        } else {
                            callback({
                                type : 'Required param',
                                info : option
                            });
                        }
                    } else {
                        // Error in the module
                        callback({
                            type : 'Type not found',
                            data : optionValue.type
                        });
                    }
                },
                function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        blueModule.run(finalConfig, callback);
                    }
                }
            );
        } else {
            blueModule.run(finalConfig, callback);
        }
    } else {
        callback({ type : 'Module not found' });
    }
};


module.exports = Bluebox;
