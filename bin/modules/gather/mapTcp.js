/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const ping = require('../../..').pingTcp;


module.exports.desc = 'Ping client (TCP protocol)';


module.exports.opts = {
  rhost: {
    types: 'ip',
    desc: 'Host to explore',
    default: '74.125.206.104',
  },
  rport: {
    types: 'port',
    desc: 'Port to scan on chosen IPs',
    default: 80,
  },
  timeout: {
    types: 'natural',
    desc: 'Time to wait for a response, in ms.',
    default: 5000,
  },
  attempts: {
    types: 'natural',
    desc: 'Number of tryings',
    default: 3,
  },
};


module.exports.impl = opts => ping(opts.rhost, opts);
