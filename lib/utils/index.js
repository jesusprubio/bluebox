/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
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
const errMsgs = require('../../cfg/errorMsgs.json');


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


// It's sync, then we don't need a promise.
utils.requireDir = require('require-directory');


utils.validator = validator;

// Our custom validators.
utils.validator.isPort = str =>
  (validator.isNumeric(str) && (parseInt(str, 10) > 0) && (parseInt(str, 10) <= 65535));

utils.validator.isPrivateIp = require('is-local-ip');


module.exports = utils;
