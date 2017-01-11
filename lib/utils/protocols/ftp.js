/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Client = require('jsftp');

const utils = require('../../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


// TODO: This module doesn't accept a connection timeout, send a PR.
//       Moreover the client breacks during the connection if the server is down.
module.exports = (ip, credPair, opts) =>
  new Promise((resolve, reject) => {
    const conn = new Client({
      host: ip,
      port: opts.port || 21,
    });
    const user = credPair[0] || 'root';
    const pass = credPair[1] || 'root';

    conn.auth(user, pass, (err) => {
      conn.destroy();

      if (err) {
        if (/Login incorrect/.test(err)) {
          dbg('NOT valid', credPair);

          resolve(null);
        } else {
          reject(err);
        }
      } else {
        dbg('Valid', credPair);

        resolve(credPair);
      }
    });
  });
