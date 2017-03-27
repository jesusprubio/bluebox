/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mysql = require('mysql');

const utils = require('../utils');

const dbg = utils.dbg(__filename);


module.exports.auth = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false, done: false };
    const cliOpts = {
      host: rhost,
      port: opts.rport || 3306,
      connectTimeout: opts.timeout,
      // Just in case
      // TODO: This will be resulting -> brute: Server does not
      // support secure connection.
      // But we need to figure out someway to add this when it uses SSL
      // to avoid an error if the certificate is not good.
      //ssl: { rejectUnauthorized: false },
    };

    if (credPair) {
      cliOpts.user = credPair[0];
      cliOpts.password = credPair[1];
    }

    const client = mysql.createConnection(cliOpts);
    dbg('Client setup:', cliOpts);

    client.connect((err) => {
      client.destroy();
      if (err) {
        // Expected result so we don't want to stop the loop.
        if (/ER_ACCESS_DENIED_ERROR/.test(err)) {
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
