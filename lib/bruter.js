/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('./utils');

const dbg = utils.dbg(__filename);


module.exports = (rhost, brute, opts = {}) =>
  new Promise((resolve, reject) => {
    const valids = [];
    let actives = 0;
    let next1 = opts.iter1.next();
    let next2;
    // Some of our protocols doesn't include passwords, ie: TFTP.
    let has2 = false;

    dbg(`Starting, IP: ${rhost}, options`, opts);

    if (opts.iter2 && opts.iter2.next) {
      next2 = opts.iter2.next();
      has2 = true;
    }
    let first1 = true;

    const interval = setInterval(() => {
      if (actives > opts.concurrency) { return; }

      if (next1.done) {
        // Waiting untill all finish.
        if (actives === 0) {
          resolve(valids);
          clearInterval(interval);
        }
        return;
      }

      if (has2 && next2.done) {
        // "Restarting" the generator.
        opts.iter2.reset();
        next2 = opts.iter2.next();
        // Increasing the user iterator.
        next1 = opts.iter1.next();
        first1 = true;
        return;
      }

      const actual1 = next1.value;
      let actual2;
      if (has2) { actual2 = next2.value; }
      const actualPair = [actual1, actual2];
      dbg('Starting for', actualPair);
      if (has2) {
        next2 = opts.iter2.next();
      } else {
        next1 = opts.iter1.next();
      }

      function parseRes(res, pair) {
        const info = { valid: false, pair };

        if (res.done) {
          let trimmed = pair;
          // To avoid return thinks like ['filename', null] (ie: TFTP brute)
          if (!has2) { trimmed = pair[0]; }

          valids.push(trimmed);
          info.valid = true;
        }

        opts.events.emit('info', info);
      }

      let additional = () => Promise.resolve();
      const addPair = [actual1, actual1];
      if (has2 && opts.repeat1 === true && first1) {
        dbg('Adding a request with the same user as pass');
        first1 = false;
        additional = () => brute(rhost, addPair, opts);
      }

      actives += 1;
      additional()
      .then((resA) => {
        dbg('Response received (additional)', { actual1, resA });
        if (has2 && resA) { parseRes(resA, addPair); }
        actives -= 1;

        let finalPair = actualPair;
        // For convenience, to avoid passing an array with the second item always null.
        if (!has2) { finalPair = actualPair[0]; }

        actives += 1;
        brute(rhost, finalPair, opts)
        .then((resB) => {
          actives -= 1;
          dbg('Response received', { actualPair, resB });
          parseRes(resB, actualPair);
        })
        .catch((err) => {
          actives -= 1;
          reject(new Error(`brute: ${err.message}`));
          clearInterval(interval);
        });
      })
      .catch((err) => {
        actives -= 1;
        reject(new Error(`additional: ${err.message}`));
        clearInterval(interval);
      });
    }, opts.delay);
  });
