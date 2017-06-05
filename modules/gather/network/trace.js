/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const Traceroute = require('nodejs-traceroute');

const utils = require('../../../lib/utils');

const dbg = utils.dbg(__filename);


module.exports.desc = 'Display the route of your packages.';


module.exports.opts = {
  rhost: {
    types: 'ip',
    desc: 'Host to explore',
    default: '8.8.8.8',
  },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
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

      tracer.trace(opts.rhost);
    } catch (err) {
      reject(err);
    }
  });
