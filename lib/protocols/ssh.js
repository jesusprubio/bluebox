/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Client = require('ssh2').Client;

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


function getPromise(rhost, credPair, action, opts) {
  return new Promise((resolve, reject) => {
    const result = { up: false, authed: false };
    const cliOpts = {
      host: rhost,
      port: opts.rport || 22,
      // TODO: Add support
      // privateKey: require('fs').readFileSync('/here/is/my/key')
      readyTimeout: opts.timeout || 3000,
    };
    if (credPair) {
      if (credPair[0]) { cliOpts.username = credPair[0]; }
      if (credPair[1]) { cliOpts.password = credPair[1]; }
    }

    const client = new Client();

    client.on('error', (err) => {
      client.destroy();

      if (/authentication/.test(err)) {
        dbg('NOT valid', credPair);

        result.up = true;
        resolve(result);
      } else {
        reject(err);
      }
    });

    client.on('ready', () => {
      client.destroy();

      dbg('Valid', credPair);
      result.up = true;
      result.authed = true;
      resolve(result);
    });

    client.connect();
  });
}


module.exports.map = (rhost, opts = {}) => getPromise(rhost, null, null, opts);


module.exports.brute = (rhost, credPair, opts = {}) => getPromise(rhost, credPair, null, opts);

// TODO
// module.exports.post = (rhost, credPair, action, opts = {}) =>
//   getPromise(rhost, credPair, action, opts);
