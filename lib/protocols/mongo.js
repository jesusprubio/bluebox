/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const mongo = require('mongodb');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);
const client = mongo.MongoClient;


module.exports.brute = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { connected: false };
    const port = opts.rport || 27017;
    const timeout = opts.timeout || 5000;
    let authStr = '';

    if (credPair && credPair[0]) { authStr = `${credPair[0]}:${credPair[1]}@`; }

    dbg('Client setup:', { rhost, port, timeout, authStr });
    client.connect(
      `mongodb://${rhost}:${port}/admin?autoReconnect=false&connectTimeoutMS=${timeout}`,
      {
        numberOfRetries: 0, // by default tries 5 times
        retryMiliSeconds: 0, // just in case
      },
      (err) => {
        // TODO: Destroy/close client, not supported by the module
        if (err) {
          // Only in this case we want to stop the chain
          if (/auth failed/.exec(err)) {
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
      }
    );
  });
