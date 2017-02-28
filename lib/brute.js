/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';


const utils = require('./utils');

const protocols = utils.requireDir(module, './protocols');
const dbg = utils.dbg(__filename);
const logger = require('../bin/utils/logger');


module.exports = (rhost, opts = {}) =>
  new Promise((resolve, reject) => {
    dbg(`Starting, IP: ${rhost}, options`, opts);

    const brute = protocols[opts.proto].brute;
    const valids = [];
    let actives = 0;
    let nextUser = opts.users.next();
    let nextPass;
    // Some of our protocols doesn't include passwords, ie: TFTP.
    let hasPass = false;
    if (opts.passwords && opts.passwords.next) {
      nextPass = opts.passwords.next();
      hasPass = true;
    }
    let firstUser = true;

    const interval = setInterval(() => {
      if (actives > opts.concurrency) { return; }

      if (nextUser.done) {
        // Waiting untill all finish.
        if (actives === 0) {
          resolve(valids);
          clearInterval(interval);
        }
        return;
      }

      if (hasPass && nextPass.done) {
        // "Restarting" the generator.
        opts.passwords.reset();
        nextPass = opts.passwords.next();
        // Increasing the user iterator.
        nextUser = opts.users.next();
        firstUser = true;
        return;
      }

      const actualUser = nextUser.value;
      let nextPassValue;
      if (hasPass) { nextPassValue = nextPass.value; }
      const credPair = [actualUser, nextPassValue];
      dbg('Starting for', credPair);
      if (hasPass) {
        nextPass = opts.passwords.next();
      } else {
        nextUser = opts.users.next();
      }

      function parseRes(res, pair) {
        // TODO: Do not print here! Do it in the client.
        // But we need to emit an event from here before.
        let toPrint = pair[0];
        if (hasPass) { toPrint = `${toPrint} / ${pair[1]}`; }
        if (res.authed) {
          let trimmed = pair;
          // To avoid return thinks like ['filename', null] (ie: TFTP brute)
          if (!hasPass) { trimmed = pair[0]; }

          logger.result(`${toPrint} ${logger.emoji('ok_hand')}`);
          valids.push(trimmed);
        } else {
          logger.info(toPrint);
        }
      }

      let additional = () => Promise.resolve();
      const addPair = [actualUser, actualUser];
      if (hasPass && opts.userAsPass === true && firstUser) {
        dbg('Adding a request with the same user as pass');
        firstUser = false;
        additional = () => brute(rhost, addPair, opts);
      }

      actives += 1;
      additional()
      .then((resA) => {
        dbg('Response received (additional)', { actualUser, resA });
        if (hasPass && resA) { parseRes(resA, addPair); }
        actives -= 1;

        let finalPair = credPair;
        // For convenience, to avoid passing an array with the second item always null.
        if (!hasPass) { finalPair = credPair[0]; }

        actives += 1;
        brute(rhost, finalPair, opts)
        .then((resB) => {
          actives -= 1;
          dbg('Response received', { credPair, resB });
          parseRes(resB, credPair);
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
