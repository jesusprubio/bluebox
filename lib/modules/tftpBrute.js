// Copyright Sergio García <s3rgio.gr gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';


const Tftp = require('tftp-client');
const async = require('async');
const logger = require('../utils/logger');


module.exports.help = {
  description: 'TFTP files brute force',
  options: {
    target: {
      type: 'ip',
      description: 'Host to attack',
      defaultValue: '127.0.0.1',
    },
    port: {
      type: 'port',
      description: 'Port to attack on chosen IPs',
      defaultValue: 69,
    },
    fileList: {
      type: 'userPass',
      description: 'File (or file with them) to test',
      defaultValue: 'file:../artifacts/dics/tftp.txt',
    },
    delay: {
      type: 'positiveInt',
      description: 'Delay between requests, in ms.',
      defaultValue: 0,
    },
  // TODO: "timeout" not supported by the module (hardcoded, returns 0)
  },
};


module.exports.run = (options, callback) => {
  const result = [];
  let indexCount = 0; // User with delay to know in which index we are

  // We avoid to parallelize here to control the interval of the requests
  async.eachSeries(options.fileList, (file, asyncCb) => {
    const client = new Tftp(options.port, options.target);

    function delayCb() {
      if (indexCount === options.fileList.length) {
        asyncCb();
      } else {
        setTimeout(asyncCb, options.delay);
      }
    }

    indexCount += 1;

    client.read(file, err => {
      // TODO: Destroy/close client, not supported by the module
      if (err) {
        if (/File not found/.test(err)) {
          logger.infoHigh(`File NOT found : ${file}`);
          delayCb();
        } else {
          asyncCb(err);
        }
      } else {
        result.push({ file });
        logger.highlight(`File found: ${file}`);
        delayCb();
      }
    });
  }, err => {
    callback(err, result);
  });
};
