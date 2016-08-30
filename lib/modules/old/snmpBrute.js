// Copyright Sergio García <s3rgio.gr gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';


const snmp = require('snmp-native');
const async = require('async');
const net = require('net');

const logger = require('../utils/logger');

module.exports.help = {
  description: 'SNPM communities brute force',
  options: {
    target: {
      type: 'ip',
      description: 'Host to attack',
      defaultValue: '127.0.0.1',
    },
    port: {
      type: 'port',
      description: 'Port to attack on chosen IPs',
      defaultValue: 161,
    },
    communities: {
      type: 'userPass',
      description: 'Community (or file with them) to test',
      defaultValue: 'public',
    },
    delay: {
      type: 'positiveInt',
      description: 'Delay between requests, in ms.',
      defaultValue: 0,
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 5000,
    },
  },
};


module.exports.run = (options, callback) => {
  const result = [];
  let indexCount = 0; // User with delay to know in which index we are

  // We avoid to parallelize here to control the interval of the requests
  async.eachSeries(options.communities, (community, asyncCb) => {
    const cfg = {
      host: options.target,
      port: options.port,
      community,
      timeouts: [options.timeout],
    };

    function delayCb() {
      if (indexCount === options.communities.length) {
        asyncCb();
      } else {
        setTimeout(asyncCb, options.delay);
      }
    }

    if (net.isIPv6(options.target)) {
      cfg.family = 'udp6';
    }
    indexCount += 1;
    const session = new snmp.Session(cfg);

    session.get({ oid: [1, 3, 6, 1] }, err => {
      // TODO: Destroy/close client, not supported by the module
      if (err) {
        if (/File not found/.test(err)) {
          logger.infoHigh(`Community NOT found : ${community}`);
          delayCb();
        } else {
          asyncCb(err);
        }
      } else {
        result.push({ community });
        logger.highlight(`Commnunity: ${community}`);
        delayCb();
      }
    });
  }, err => {
    callback(err, result);
  });
};
