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


utils.pathToName = (fullPath) => {
  const res = path.basename(fullPath, '.js');

  if (!res || res === fullPath) {
    throw new Error(errorMsgs.pathToName.badPath);
  } else {
    return res;
  }
};


// It's sync, then we don't need a promise.
// TODO: Change for an async one #perfmatters
utils.requireDir = require('require-directory');

utils.Promise = require('bluebird');

// Bluebird accepts the objects returned by this as a valid Iterable.
utils.ProductIterable = require('product-iterable');

utils.debug = (tag) => debug(`${pkgName}:${tag}`);


module.exports = utils;
