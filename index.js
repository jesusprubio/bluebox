// Copyright Jesus Perez <jesusprubio gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const requireDir = require('require-directory');
const lodash = require('lodash');

const utils = require('./lib/utils/common');
const pkgInfo = require('./package.json');


class Bluebox {

  constructor(opts) {
    this.shodanKey = opts.shodanKey || null;
    // Loading all present modules.
    this.modules = lodash.extend(
        requireDir(module, './lib/modules'),
        requireDir(module, './lib/modules/private')
    );
  }


  version() { return pkgInfo.version; }


  // TODO: Allow to pass a value to get only help of a param
  help() { return this.modules; }


  setShodanKey(value) { this.shodanKey = value; }


  runModule(moduleName, config, callback) {
    if (!this.modules[moduleName]) {
      callback({
        message: 'Module not found',
        error: null,
      });

      return;
    }
    const blueModule = this.modules[moduleName];

    // Parsing the paremeters passed by the client
    utils.parseOpts(
      config,
      blueModule.help.options,
      (err, finalConfig) => {
        const confWithKey = finalConfig;
        if (err) {
          callback({
            message: 'Parsing the options',
            error: err,
          });

          return;
        }
        if (moduleName.substr(0, 6) === 'shodan') {
          confWithKey.key = self.shodanKey;
        }
        blueModule.run(confWithKey, callback);
      }
    );
  }
}


module.exports = Bluebox;
