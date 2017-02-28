/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const search = require('shodan-client').host;


module.exports.desc = 'Look if the target is indexed by SHODAN computer search engine.';


module.exports.opts = {
  rhost: {
    types: 'ip',
    desc: 'Host to explore',
    default: '8.8.8.8',
  },
  // We need to use different names for different keys to allow to set
  // them as global variables (more comfortable).
  keyS: { desc: 'SHODAN API key' },
  timeout: {
    types: 'natural',
    desc: 'Time to wait for a response, in ms.',
    // Sometimes the API is too slow.
    default: 20000,
  },
};


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;

  // We prefer to get all the records SHODAN have about this host.
  finalOpts.history = true;

  return search(opts.rhost, opts.keyS, finalOpts);
};
