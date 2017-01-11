/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const pkgInfo = require('../package.json');
const utils = require('./lib/utils');
const parseOpts = require('./lib/utils/parseOpts');
const errMsgs = require('./lib/utils/errorMsgs').index;

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


class BlueboxCli {

  constructor(opts) {
    this.shodanKey = opts.shodanKey || null;
    // Loading all present modules.
    this.modules = utils.extend(
      utils.requireDir(module, './lib/modules'),
      utils.requireDir(module, './lib/modules/private')
    );
    this.version = pkgInfo.version;

    dbg('Started', { version: pkgInfo.version });
  }


  help() { return this.modules; }


  getShodanKey() { return this.shodanKey; }


  setShodanKey(value) { this.shodanKey = value; }


  // Should always return a promise.
  run(moduleName, cfg) {
    dbg('Running module:', { name: moduleName, cfg });

    if (!this.modules[moduleName]) {
      return Promise.reject(new Error(errMsgs.notFound));
    }

    const blueModule = this.modules[moduleName];

    // Parsing the paremeters passed by the client.
    let confWithKey;
    try {
      confWithKey = parseOpts(cfg, blueModule.options);
    } catch (err) {
      return Promise.reject(new Error(`${errMsgs.parseOpts} : ${err.message}`));
    }
    if (moduleName.substr(0, 6) === 'shodan') {
      if (!this.shodanKey) { return Promise.reject(new Error(errMsgs.noKey)); }
      confWithKey.key = this.shodanKey;
    }

    return blueModule.run(confWithKey);
  }
}

module.exports = BlueboxCli;
