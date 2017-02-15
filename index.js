/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const pkgInfo = require('./package.json');
const utils = require('./lib/utils');

// Root methods.
const bluebox = utils.requireDir(module, './lib/index');

// Grouped methods.
bluebox.dns = utils.requireDir(module, './lib/dns');
bluebox.wifi = utils.requireDir(module, './lib/wifi');

// We only want to expose some of them.
bluebox.utils = {
  validator: utils.validator,
  ProductIterable: utils.ProductIterable,
  requireDir: utils.requireDir,
  localIp: utils.localIp,
  ipInRange: utils.ipInRange,
  netCalc: utils.netCalc,
};

// The only only allowed here because it's never going to be required individually.
bluebox.version = () => pkgInfo.version;

// Full external objects. They're not going to be required individually, it would have
// more sense to require the single dependency instead.
bluebox.shodan = require('shodan-client');

// The full client also is exposed to use it programatically.
bluebox.Cli = require('./bin/Cli');


module.exports = bluebox;
