/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const Traceroute = require('nodejs-traceroute');

const errMsgs = require('../utils/errorMsgs');
const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


module.exports = target =>
  new Promise((resolve, reject) => {
    if (!target) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if (!utils.validator.isFQDN(target) && !utils.validator.isIP(target)) {
      reject(new Error(errMsgs.paramBad));

      return;
    }

    const hops = [];
    try {
      const tracer = new Traceroute();

      tracer
        .on('hop', (hop) => {
          hops.push(hop);
          dbg(`hop: ${JSON.stringify(hop)}`);
        })
        .on('close', (code) => {
          dbg(`close: code ${code}`);
          resolve(hops);
        });

      tracer.trace(target);
    } catch (err) {
      reject(err);
    }
  });
