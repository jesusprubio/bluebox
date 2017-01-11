/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const libnmap = require('libnmap');

const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');

const scanner = utils.Promise.promisify(libnmap.scan);


// We add a default for the only mandatory one.
module.exports = (range, opts = {}) => {
  const finalOpts = opts;

  if (!range && !opts.range) {
    return utils.Promise.reject(new Error(errMsgs.paramReq));
  }

  // TODO: Check for a correct range format.

  if (range) {
    finalOpts.range = range;
  } else {
    // We also allow to pass it here to avoid confusion because the original module
    // allows to do it inside the options. But the first alternative has preference.
    finalOpts.range = opts.range;
  }

  return scanner(finalOpts);
};
