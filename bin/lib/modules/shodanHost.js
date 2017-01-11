/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const search = require('../../..').shodan.host;


module.exports.description = 'Look if the target is indexed by SHODAN computer search engine';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '8.8.8.8',
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    // Sometimes the API is too slow.
    defaultValue: 20000,
  },
};


module.exports.run = (opts) => {
  const finalOpts = opts;

  // We prefer to get all the records SHODAN have about this host.
  finalOpts.history = true;

  return search(opts.target, opts.key, finalOpts);
};
