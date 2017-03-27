/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const pkgInfo = require('./package.json');
const utils = require('./lib/utils');
const parseOpts = require('./lib/parseOpts');
const parsers = require('./lib/parsers');
const errMsgs = require('./cfg/errorMsgs').index;

const dbg = utils.dbg(__filename);


class Cli {

  // constructor(opts = {}) {
  constructor() {
    this.version = pkgInfo.version;
    this.dics = parsers.dics;

    dbg('Loading modules ...');
    const modulesRaw = utils.requireDir(module, './modules');
    dbg('Creating our module names from their paths ...');
    this.modules = {};
    utils.each(Object.keys(modulesRaw), (modulePath) => {
      utils.each(Object.keys(modulesRaw[modulePath]), (subPath) => {
        // Only 3 levels allowed for now.
        // To get the ones without a subfolder.
        if (modulesRaw[modulePath][subPath].impl) {
          this.modules[`${modulePath}/${subPath}`] = modulesRaw[modulePath][subPath];
        } else {
          utils.each(Object.keys(modulesRaw[modulePath][subPath]), (lastPath) => {
            if (modulesRaw[modulePath][subPath][lastPath].impl) {
              this.modules[`${modulePath}/${subPath}/${lastPath}`] =
                modulesRaw[modulePath][subPath][lastPath];
            } else {
              utils.each(Object.keys(modulesRaw[modulePath][subPath][lastPath]), (oneMore) => {
                this.modules[`${modulePath}/${subPath}/${lastPath}/${oneMore}`] =
                  modulesRaw[modulePath][subPath][lastPath][oneMore];
              });
            }
          });
        }
      });
    });

    dbg('Started', { version: pkgInfo.version });
  }


  // Should always return a promise.
  run(moduleName, passedOpts) {
    dbg('Running module:', { name: moduleName, passedOpts });

    if (!this.modules[moduleName]) {
      return Promise.reject(new Error(errMsgs.notFound));
    }

    const blueModule = this.modules[moduleName];

    // Parsing the paremeters passed by the client.
    let opts;
    try {
      opts = parseOpts(passedOpts, blueModule.opts);
    } catch (err) {
      return Promise.reject(new Error(`${errMsgs.parseOpts} : ${err.message}`));
    }

    return blueModule.impl(opts);
  }
}


module.exports = Cli;
