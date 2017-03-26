/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mongo = require('mongodb');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);
const client = mongo.MongoClient;


module.exports.auth = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false, done: false };
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
      }
    );
  });
