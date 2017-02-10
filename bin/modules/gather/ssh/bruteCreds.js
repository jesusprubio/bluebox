/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>
            Aan Wahyu <cacaddv gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../..').bruteCreds;
const commonOpts = require('../../../lib/commonOpts/bruteCreds');


module.exports.desc = 'SSH credentials brute force';


// To avoid to repeat them in all modules from "brute/creds".
module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ssh';

  return brute(opts.rhost, finalOpts);
};
