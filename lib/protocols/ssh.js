/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const Client = require('ssh2').Client;

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


function getPromise(rhost, credPair, action, opts) {
  return new Promise((resolve, reject) => {
    dbg('Starting, passed opts:', { rhost, credPair, action, opts });
    const result = { up: false, authed: false };
    const cliOpts = {
      host: rhost,
      port: opts.rport || 22,
      // TODO: Add support
      // privateKey: require('fs').readFileSync('/here/is/my/key')
      readyTimeout: opts.timeout || 3000,
      // This module emits an error if no valid one is passed.
      username: 'root',
      password: 'root',
    };
    if (credPair) {
      if (credPair[0]) { cliOpts.username = credPair[0]; }
      if (credPair[1]) { cliOpts.password = credPair[1]; }
    }

    const client = new Client();

    client.on('error', (err) => {
      client.destroy();

      if (/All configured authentication methods failed/.test(err)) {
        dbg('NOT valid', credPair);

        result.up = true;
        resolve(result);
      } else {
        reject(err);
      }
    });

    client.on('ready', () => {
      dbg('Connected');
      client.destroy();

      dbg('Valid', credPair);
      result.up = true;
      result.authed = true;
      resolve(result);
    });

    dbg('Connecting, opts', cliOpts);
    try {
      client.connect(cliOpts);
    } catch (err) {
      client.destroy();
      reject(err);
    }
  });
}


module.exports.map = (rhost, opts = {}) => getPromise(rhost, null, null, opts);


module.exports.bruteCreds = (rhost, credPair, opts = {}) => getPromise(rhost, credPair, null, opts);
