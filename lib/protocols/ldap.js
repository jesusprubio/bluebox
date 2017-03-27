/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const ldap = require('ldapjs');

const utils = require('../utils');

const dbg = utils.dbg(__filename);


module.exports.auth = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false, done: false };
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
          result.up = true;
          resolve(result);
        } else {
          reject(err);
        }

        return;
      }

      dbg('Valid', credPair);
      result.up = true;
      result.done = true;
      resolve(result);
    });
  });
