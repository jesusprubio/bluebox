/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const utils = require('../utils');

const Promise = utils.Promise;
const cli = Promise.promisify(require('tcp-ping').ping);

const dbg = utils.dbg(__filename);


module.exports.map = (rhost, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false };
    const cliOpts = {
      address: rhost,
      port: opts.rport || 80,
      timeout: opts.timeout || 5000,
      attempts: 1,
    };

    dbg('Starting, opts', cliOpts);
    cli(cliOpts)
    .then((res) => {
      dbg('Response received', res);

      // We're only sending one so if no max -> host down.
      if (res.max) {
        result.up = true;
        // We only made one, so avg is the same and the parsing is easier.
        result.data = { time: res.avg };
      }

      resolve(result);
    })
    .catch(err => reject(err));
  });
