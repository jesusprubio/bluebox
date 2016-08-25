// Copyright Jesus Perez <jesusprubio gmail com>
//           Sergio Garca <s3rgio.gr gmail com>
//           Aan Wahyu <cacaddv gmail com>
//
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const Client = require('ssh2').Client;

const logger = require('../utils/logger');


module.exports = (opts) =>
  new Promise((resolve, reject) => {
    const userName = opts.credPair[0];
    const password = opts.credPair[1];

    const conn = new Client();

    conn.on('error', err => {
      conn.destroy();

      if (/authentication/.test(err)) {
        logger.infoHigh(`Valid credentials NOT found for: ${userName} | ${password}`);

        resolve(null);
      } else {
        reject(err);
      }
    });

    conn.on('ready', () => {
      conn.destroy();

      // TODO: Abstract the string.
      logger.highlight(`Valid credentials found: ${userName} | ${password}`);

      resolve([userName, password]);
    });

    conn.connect({
      host: opts.target,
      port: opts.port,
      username: userName,
      password,
      // TODO: Add support
      // privateKey: require('fs').readFileSync('/here/is/my/key')
      readyTimeout: opts.timeout,
    });
  });
