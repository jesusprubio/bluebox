/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const ldap = require('ldapjs');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


module.exports.brute = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { connected: false };
    const port = opts.rport || 389;
    const user = credPair[0];
    let lpath = '';

    if (user) { lpath = user.split(',').slice(1); }

    const url = `ldap://${rhost}:${port}/${lpath}`;
    const client = ldap.createClient({ url });

    dbg('Client setup:', { url });
    client.bind(credPair[0], credPair[1], (err) => {
      // TODO: Destroy/close client, not supported by the module
      if (err) {
        // Expected result so we don't want to stop the loop.
        if (/Invalid Credentials/.test(err)) {
          dbg('NOT valid', credPair);

          resolve(result);
        } else {
          reject(err);
        }

        return;
      }

      dbg('Valid', credPair);
      result.connected = true;
      resolve(result);
    });
  });
