/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const search = require('../../..').shodan.search;


module.exports.description = 'Find potential targets in SHODAN computer search engine';


module.exports.options = {
  query: {
    type: 'allValid',
    description: 'Query to search about, could include port, country, product, etc.',
    defaultValue: 'openssh',
  },
  pages: {
    type: 'positiveInt',
    description: 'Number of pages (of results) to return (only 1 allowed with free accounts)',
    defaultValue: 1,
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    // Sometimes the API is too slow.
    defaultValue: 20000,
  },
};


module.exports.run = opts => search(opts.query, opts.key, opts);
