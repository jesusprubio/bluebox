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

const pkgInfo = require('./package.json');
const utils = require('./lib/utils');
const parseOpts = require('./lib/utils/parseOpts');
const errMsgs = require('./lib/utils/errorMsgs').index;

const Promise = utils.Promise;
const debug = utils.debug(utils.pathToName(__filename));


class Bluebox {

  constructor(opts) {
    this.shodanKey = opts.shodanKey || null;
    // Loading all present modules.
    this.modules = utils.extend(
      utils.requireDir(module, './lib/modules'),
      utils.requireDir(module, './lib/modules/private')
    );

    debug('Started', { version: pkgInfo.version });
  }


  version() { return pkgInfo.version; }


  help() { return this.modules; }


  getShodanKey() { return this.shodanKey; }


  setShodanKey(value) { this.shodanKey = value; }


  run(moduleName, cfg) {
    return new Promise((resolve, reject) => {
      debug('Running module:', { name: moduleName, cfg });

      if (!this.modules[moduleName]) {
        reject(new Error(errMsgs.notFound));
        return;
      }

      const blueModule = this.modules[moduleName];

      // Parsing the paremeters passed by the client.
      let confWithKey;
      try {
        confWithKey = parseOpts(cfg, blueModule.options);
      } catch (err) {
        reject(new Error(`${errMsgs.parseOpts} : ${err.message}`));
      }
      if (moduleName.substr(0, 6) === 'shodan') {
        if (!this.shodanKey) { reject(new Error(errMsgs.noKey)); }
        confWithKey.key = this.shodanKey;
      }

      // Returning another promise.
      resolve(blueModule.run(confWithKey));
    });
  }
}

module.exports = Bluebox;
