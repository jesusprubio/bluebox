/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const map = require('../../..').map.services;
const scanComOpts = require('../../cfg/commonOpts/map');


module.exports.desc = 'Ping TCP mapper';


module.exports.opts = scanComOpts;


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;
  finalOpts.proto = 'pingTcp';

  return map(opts.rhosts, finalOpts);
};
