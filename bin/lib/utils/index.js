/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const debug = require('debug');

// The library utils object as base.
const utils = require('../../../lib/utils');

const pkgName = require('../../../package.json').name;

// Custom tag to difference from the library debug.
utils.dbg = fullPath => debug(`${pkgName}:Cli:${utils.pathToTag(fullPath)}`);

module.exports = utils;
