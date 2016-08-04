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
const debug = require('./lib/utils/debug')(utils.pathToName(__filename));


class Bluebox {

  constructor(opts) {
    this.shodanKey = opts.shodanKey || null;
    // Loading all present modules.
    this.modules = lodash.extend(
      requireDir(module, './lib/modules'),
      requireDir(module, './lib/modules/private')
    );

    debug('Started:', { version: pkgInfo.version });
  }


  version() { return pkgInfo.version; }


  // TODO: Allow to pass a value to get only help of a param
  help() { return this.modules; }


  setShodanKey(value) { this.shodanKey = value; }


  runModule(moduleName, cfg, callback) {
    debug('Running module:', { name: moduleName, cfg });

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
      cfg,
      blueModule.help.options,
      (err, finalCfg) => {
        if (err) {
          callback({
            message: 'Parsing the options',
            error: err,
          });

          return;
        }

        const confWithKey = finalCfg;

        if (moduleName.substr(0, 6) === 'shodan') {
          if (this.shodanKey) {
            confWithKey.key = this.shodanKey;
          } else {
            callback({
              message: 'A SHODAN key is needed to run this module ' +
                       '(https://account.shodan.io/register)',
              error: null,
            });

            return;
          }
        }

        blueModule.run(confWithKey, callback);
      }
    );
  }
}


module.exports = Bluebox;
