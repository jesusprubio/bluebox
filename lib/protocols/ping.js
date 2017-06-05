/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const utils = require('../utils');

const cli = require('ping');

const dbg = utils.dbg(__filename);


module.exports.map = (rhost, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false };
    const timeout = opts.timeout || 5000;
    const cliOpts = {
      timeout: timeout / 1000,
      // TODO: Add as parameter
      extra: ['-i', '2'], // 2 attempt
    };

    dbg('Starting, opts', cliOpts);
    cli.promise.probe(rhost, cliOpts)
    .then((res) => {
      dbg('Response received', res);

      // We're only sending one so if no max -> host down.
      if (res.alive) {
        result.up = true;
        // We only made one, so avg is the same and the parsing is easier.
        result.data = res.output;
      }

      resolve(result);
    })
    .catch(err => reject(err));
  });
