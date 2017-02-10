/*
  Copyright Sergio Garcia <s3rgio.gr gmail com>
            Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const net = require('net');

const snmp = require('snmp-native');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


module.exports.brute = (rhost, community, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { connected: false };
    const cliOpts = {
      host: rhost,
      port: opts.rport || 161,
      community,
      timeouts: [opts.timeout || 5000],
    };

    if (net.isIPv6(rhost)) { cliOpts.family = 'udp6'; }

    dbg('Client setup:', cliOpts);
    const client = new snmp.Session(cliOpts);

    client.get({ oid: [1, 3, 6, 1] }, (err) => {
      // TODO: Destroy/close client, not supported by the module
      if (err) {
        // Expected result so we don't want to stop the loop.
        if (/File not found/.test(err)) {
          dbg('NOT valid', community);

          resolve(result);
        } else {
          reject(err);
        }

        return;
      }

      dbg('Valid', { community });
      result.connected = true;
      resolve(result);
    });
  });
