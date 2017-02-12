/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Tftp = require('tftp-client');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


module.exports.brute = (rhost, filename, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false, authed: false };
    const port = opts.rport || 69;

    dbg('Client setup:', { port });
    const client = new Tftp(port, rhost);

    client.read(filename, (err) => {
      // TODO: Destroy/close client, not supported by the module
      if (err) {
        // Expected result so we don't want to stop the loop.
        if (/File not found/.test(err)) {
          dbg('NOT valid', filename);
          result.up = true;
          resolve(result);
        } else {
          reject(err);
        }

        return;
      }

      dbg('Valid', { filename });
      result.up = true;
      result.authed = true;
      resolve(result);
    });
  });
