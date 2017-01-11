/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const trace = require('../../..').trace;


module.exports.description = 'Display the route of your packages';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '8.8.8.8',
  },
};


module.exports.run = opts => trace(opts.target);
