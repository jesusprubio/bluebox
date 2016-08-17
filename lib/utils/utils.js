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

// All common helpers here. Used in other files of this folder and through
// the whole project.

const path = require('path');

// Lodash as base.
const utils = require('lodash');
const debug = require('debug');


const pkgName = require('../../package.json').name;
const errorMsgs = require('./errorMsgs');


// It's sync, then we don't need a promise.
// TODO: Change for an async one #perfmatters
utils.requireDir = require('require-directory');


// TODO: Check performance with natives. But we're using some
// not standard: Promise.series, Promise.promisify. Posible native replacements:
// - https://github.com/terinjokes/promise-series
// - https://github.com/paulmillr/micro-promisify
// - https://github.com/allain/any-promisify
utils.Promise = require('bluebird');


utils.debug = (tag) => debug(`${pkgName}:${tag}`);


utils.pathToName = (fullPath) => {
  const res = path.basename(fullPath, '.js');

  if (!res || res === fullPath) {
    throw new Error(errorMsgs.pathToName.badPath);
  } else {
    return res;
  }
};


module.exports = utils;
