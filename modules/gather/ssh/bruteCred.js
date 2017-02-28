/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr@gmail.com>
            Aan Wahyu <cacaddv@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const brute = require('../../../lib/brute');
const commonOpts = require('../../../cfg/commonOpts/bruteCred');


module.exports.desc = 'SSH credentials brute force.';


// To avoid to repeat them in all modules from "brute/creds".
module.exports.opts = commonOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'ssh';

  return brute(opts.rhost, finalOpts);
};
