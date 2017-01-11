/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Client = require('ssh2').Client;

const utils = require('../../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


module.exports = (ip, credPair, opts) =>
  new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('error', (err) => {
      conn.destroy();

      if (/authentication/.test(err)) {
        // TODO: Add an error emitter in cases like this.
        dbg('NOT valid', credPair);

        resolve(null);
      } else {
        reject(err);
      }
    });

    conn.on('ready', () => {
      conn.destroy();

      dbg('Valid', credPair);

      resolve(credPair);
    });

    conn.connect({
      host: ip || '127.0.0.1',
      port: opts.port || 22,
      username: credPair[0] || 'root',
      password: credPair[1] || 'root',
      // TODO: Add support
      // privateKey: require('fs').readFileSync('/here/is/my/key')
      readyTimeout: opts.timeout || 3000,
    });
  });
