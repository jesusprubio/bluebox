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

var requireDir = require('require-directory'),

    utils = require('./utils/common'),

    PKG_INFO = require('./package.json');

// Display the execution time for Node.js modules
//require("time-require");


// Constructor

function Bluebox(options) {
    this.shodanKey = options.shodanKey || null;
    this.modulesInfo = requireDir(module, './modules');
}


// Public stuff

Bluebox.prototype.version = function () {
    return PKG_INFO.version;
};

Bluebox.prototype.getModulesInfo = function () {
    return this.modulesInfo;
};

Bluebox.prototype.setShodanKey = function (value) {
    this.shodanKey = value;
};

Bluebox.prototype.runModule = function (moduleName, config, callback) {
    var self = this,
        blueModule;

    if (!this.modulesInfo[moduleName]) {
        callback({
            message: 'Module not found',
            error: null
        });

        return;
    }
    blueModule = require('./modules/' + moduleName);
    // Parsing the paremeters passed by the client
    utils.parseOptions(
        config,
        this.modulesInfo[moduleName].help.options,
        function (err, finalConfig) {
            if (err) {
                callback({
                    message: 'Parsing the options',
                    error: err
                });

                return;
            }
            if (moduleName.substr(0, 6) === 'shodan') {
                finalConfig.key = self.shodanKey;
            }
            blueModule.run(finalConfig, callback);
        }
    );
};

module.exports = Bluebox;
