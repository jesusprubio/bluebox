/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

// http://nodejs.org/api/net.html
const net = require('net');

const utils = require('../utils');


const dbg = utils.dbg(__filename);


module.exports.map = (rhost, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false };
    const rport = opts.rport || 80;
    const timeout = opts.timeout || 5000;

    dbg('Starting, opts', opts);

    const client = new net.Socket();
    client.setTimeout(timeout);

    client.on('data', (data) => {
      dbg(`Received: ${data}`);

      // returned = true;
      result.data = data;
      resolve(result);
      client.destroy();
    });

    client.on('timeout', () => {
      if (result.up) {
        resolve(result);
      } else {
        reject(new Error('Timeout'));
      }
      client.destroy();
    });

    client.on('error', err => reject(err));


    client.connect(rport, rhost, () => {
      dbg('Connected');
      result.up = true;

      if (!opts.banner) {
        resolve(result);
        client.destroy();
      }
    });
  });
