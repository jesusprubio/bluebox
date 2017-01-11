/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

// All common helpers here. Used in other files of this folder and through
// the whole project.

const path = require('path');

// Lodash as base.
const utils = require('lodash');
const validator = require('validator');
const debug = require('debug');

const pkgName = require('../../package.json').name;
const errMsgs = require('./errorMsgs.json');


utils.pathToTag = (fullPath) => {
  const res = path.basename(fullPath, '.js');

  if (!res || res === fullPath) {
    throw new Error(errMsgs.badPath);
  } else {
    return res;
  }
};

utils.dbg = fullPath => debug(`${pkgName}:${utils.pathToTag(fullPath)}`);

// Attaching more common stuff drom here.
utils.Promise = require('bluebird');

utils.validator = validator;

// Our custom validators.
// TODO: Add test.
utils.validator.isPort = str =>
  (validator.isNumeric(str) && (parseInt(str, 10) > 0) && (parseInt(str, 10) <= 65535));

utils.validator.isPrivateIp = require('is-local-ip');

// It's sync, then we don't need a promise.
// TODO: Change for an async one #perfmatters
utils.requireDir = require('require-directory');

// Bluebird accepts the objects returned by this as a valid Iterable.
utils.ProductIterable = require('product-iterable');

utils.localIp = require('quick-local-ip');

utils.netCalc = require('network-calculator');

utils.ipInRange = require('ip-range-check');


module.exports = utils;
