/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const ping = require('../../..').ping;


module.exports.description = 'Ping protocol client';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '8.8.8.8',
  },
};


// TODO: Allow to pass an array here.
module.exports.run = opts => ping([opts.target]);
