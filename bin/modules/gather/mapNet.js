/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nmap = require('../../..').map.net;


module.exports.desc = 'Network (host/port) scanner. Only full TCP supported for now.';


module.exports.opts = {
  rhosts: {
    desc: 'Valid IPv4 range (ie: "10.0.2.0/25", "192.168.10.80-120")',
    default: 'scanme.nmap.org',
  },
  rports: {
    desc: 'Port (or list of) to scan on chosen IPs',
    // Specific VoIP ports.
    default: '21,22,23,80,69,389,443,3306,4443,4444,5038,5060-5070,8080,8088,27017',
    // default: '21,22,80,443',
  },
  concurrency: {
    types: 'natural',
    desc: 'Max number of simultaneous socket opened',
    default: 500,
  },
  banner: {
    types: 'bool',
    desc: 'Get the banner for verbose ports',
    default: true,
  },
};


module.exports.impl = options => nmap(options.rhosts, options);
