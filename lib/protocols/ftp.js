/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const Client = require('jsftp');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


function request(rhost, credPair, action, opts) {
  return new Promise((resolve, reject) => {
    const result = { up: false, done: false };
    let firstTime = true;
    let user;
    let pass;

    if (credPair) {
      if (credPair[0]) { user = credPair[0]; }
      if (credPair[1]) { pass = credPair[1]; }
    }

    const conn = new Client({
      host: rhost,
      port: opts.rport || 21,
      connTimeout: opts.timeout || 3000,
    });

    // conn.on('error', err => reject(err));
    conn.on('error', (err) => {
      conn.destroy();
      reject(err);
    });

    conn.on('connect', () => {
      dbg('Connected');
      result.up = true;
    });

    conn.on('data', (data) => {
      dbg('New data:', data);

      if (!firstTime) { return; }
      firstTime = false;

      if (data.isError) {
        reject(new Error(data.text));
        return;
      }

      // The server banner comes only the first time here.
      if (!result.data) { result.data = data.text; }

      // For map we finish here.
      if (!credPair) {
        conn.destroy();
        resolve(result);

        return;
      }

      // We only want to send the auth once. We need this check
      // because we're passing through here more times.
      conn.auth(user, pass, (err) => {
        conn.destroy();

        if (err) {
          if (err.code === 530) {
            dbg('NOT valid', credPair);

            resolve(result);
          } else {
            reject(err);
          }

          return;
        }

        dbg('Valid', credPair);
        result.done = true;
        resolve(result);
      });
    });

    conn.on('connTimeout', () => {
      conn.destroy();
      reject(new Error('connTimeout'));
    });
  });
}


module.exports.map = (rhost, opts = {}) => request(rhost, null, null, opts);


module.exports.auth = (rhost, credPair, opts = {}) => request(rhost, credPair, null, opts);
