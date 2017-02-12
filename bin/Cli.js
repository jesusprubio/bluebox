/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const pkgInfo = require('../package.json');
const utils = require('./lib');
const parseOpts = require('./lib/parseOpts');
const errMsgs = require('./cfg/errorMsgs').index;

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


class BlueboxCli {

  // constructor(opts = {}) {
  constructor() {
    this.version = pkgInfo.version;

    dbg('Loading modules ...');
    const modulesRaw = utils.requireDir(module, './modules');
    dbg('Creating our module names from their paths ...');
    this.modules = {};
    utils.each(Object.keys(modulesRaw), (path) => {
      utils.each(Object.keys(modulesRaw[path]), (subPath) => {
        // TODO: Refactor, this has to be easier.
        // Only 3 levels allowed for now.
        // To get the ones without a subfolder.
        if (modulesRaw[path][subPath].impl) {
          this.modules[`${path}/${subPath}`] = modulesRaw[path][subPath];
        } else {
          utils.each(Object.keys(modulesRaw[path][subPath]), (lastPath) => {
            if (modulesRaw[path][subPath][lastPath].impl) {
              this.modules[`${path}/${subPath}/${lastPath}`] = modulesRaw[path][subPath][lastPath];
            } else {
              utils.each(Object.keys(modulesRaw[path][subPath][lastPath]), (oneMore) => {
                this.modules[`${path}/${subPath}/${lastPath}/${oneMore}`] =
                  modulesRaw[path][subPath][lastPath][oneMore];
              });
            }
          });
        }
      });
    });

    dbg('Started', { version: pkgInfo.version });
  }


  help() { return this.modules; }


  // Should always return a promise.
  run(moduleName, cfg) {
    dbg('Running module:', { name: moduleName, cfg });

    if (!this.modules[moduleName]) {
      return Promise.reject(new Error(errMsgs.notFound));
    }

    const blueModule = this.modules[moduleName];

    // Parsing the paremeters passed by the client.
    let opts;
    try {
      opts = parseOpts(cfg, blueModule.opts);
    } catch (err) {
      return Promise.reject(new Error(`${errMsgs.parseOpts} : ${err.message}`));
    }

    return blueModule.impl(opts);
  }
}

module.exports = BlueboxCli;
