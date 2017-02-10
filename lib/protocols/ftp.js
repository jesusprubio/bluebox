/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Client = require('jsftp');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


function getPromise(rhost, credPair, action, opts) {
  return new Promise((resolve, reject) => {
    const result = { connected: false };
    const conn = new Client({
      host: rhost,
      port: opts.rport || 21,
    });
    let user;
    let pass;

    if (credPair) {
      if (credPair[0]) { user = credPair[0]; }
      if (credPair[1]) { pass = credPair[1]; }
    }

    // TODO: Needed, working?
    // conn.on('error', err => reject(err);
    conn.on('timeout', () => reject(new Error('timeout')));

    conn.on('data', (data) => {
      if (data.isError) {
        reject(new Error(data.text));

        return;
      }
      result.data = data.msg;
    });

    conn.auth(user, pass, (err) => {
      conn.destroy();

      if (err) {
        // Expected result so we don't want to stop the loop.
        if (/Login incorrect/.test(err)) {
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
}


module.exports.map = (rhost, opts = {}) => getPromise(rhost, null, null, opts);


module.exports.brute = (rhost, credPair, opts = {}) => getPromise(rhost, credPair, null, opts);

// TODO
// module.exports.post = (rhost, credPair, action, opts = {}) =>
  // getPromise(rhost, credPair, action, opts);
