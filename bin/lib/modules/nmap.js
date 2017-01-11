/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const nmap = require('../../..').nmap;


module.exports.description = 'Network scanner, nmap wrapper';


module.exports.options = {
  targets: {
    // TODO: Improve this.
    type: 'allValid',
    description: 'Valid IPv4/v6 IP range (ie: "10.0.2.0/25", ' +
                 '"192.168.10.80-120", "fe80::42:acff:fe11:fd4e/64")',
    // defaultValue: 'scanme.nmap.org',
    defaultValue: '127.0.0.1',
  },
  ports: {
    type: 'allValid',
    description: 'Port (or list of) to scan on chosen IPs',
    // TODO: check this!!, specific for VoIP for now
    // defaultValue: '21,22,23,80,69,389,443,3306,4443,4444,5038,5060-5070,8080,8088,27017'
    defaultValue: '21,22,23,80',
  },
  binPath: {
    type: 'allValid',
    description: 'Path of the nmap binary',
    defaultValue: 'nmap', // Not need to include full nmap path
                          // https://github.com/jas-/node-libnmap/issues/28
  },
};


module.exports.run = opts => nmap([opts.targets], opts);
