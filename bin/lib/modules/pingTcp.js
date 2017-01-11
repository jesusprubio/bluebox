/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const ping = require('../../..').pingTcp;


module.exports.description = 'Ping client (TCP protocol)';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '74.125.206.104',
  },
  port: {
    type: 'port',
    description: 'Port to scan on chosen IPs',
    defaultValue: 80,
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    defaultValue: 5000,
  },
  attempts: {
    type: 'positiveInt',
    description: 'Number of tryings',
    defaultValue: 3,
  },
};


module.exports.run = opts => ping(opts.target, opts);
