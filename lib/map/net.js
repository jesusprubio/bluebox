/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Evilscan = require('evilscan');

const utils = require('../utils');
const errMsgs = require('../utils/errorMsgs');

const Promise = utils.Promise;


// We add a default for the only mandatory one.
module.exports = (rhosts, opts = {}) =>
  new Promise((resolve, reject) => {
    if (!rhosts) {
      utils.Promise.reject(new Error(errMsgs.paramReq));
      return;
    }

    let ports;
    // The library needs a strign format instead of an array.
    if (opts.ports) { ports = opts.ports.toString(); }
    // TODO: Check for a correct range format.
    const scanner = new Evilscan({
      target: rhosts,
      port: ports || '21,22,80,443',
      reverse: false,
      geo: false,
      concurrency: opts.concurrency || 500,
      status: 'TROU',
      timeout: opts.timeout || 5000,
      banner: opts.banner || true,
      // TODO: Needed?
      // display: json,
    });

    const results = [];
    // Fired in any match
    scanner.on('result', data => results.push(data));

    scanner.on('error', err => reject(err));

    scanner.on('done', () => resolve(results));

    scanner.run();
  });
