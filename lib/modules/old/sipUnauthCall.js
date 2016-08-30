// Copyright Sergio García <s3rgio.gr gmail com>
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
  description: 'To check if a SIP server allows unauthenticated calls',
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
    fromExt: {
      type: 'userPass',
      description: 'Extension which make the call',
      defaultValue: 'range:100-110',
    },
    toExt: {
      type: 'userPass',
      description: 'Extension which receive the call',
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
    data: [],
  };
  let indexCountFrom = 0; // User with delay to know in which index we are
  let indexCountTo = 0;
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

  // We avoid to parallelize here to control the interval of the requests
  async.eachSeries(options.fromExt, (fromExt, asyncCbFrom) => {
    indexCountFrom += 1;
    indexCountTo = 0;
    async.eachSeries(options.toExt, (toExt, asyncCbTo) => {
      // We use a new stack in each request to simulate different users
      const msgConfig = {
        meth: 'INVITE',
        fromExt,
        toExt,
      };

      const fakeStack = new SipFakeStack(stackConfig);

      indexCountTo += 1;

      // TODO: We need to be more polited here, an ACK and BYE
      // is needed to avoid loops
      fakeStack.send(msgConfig, (err, res) => {
        let partialResult = {};
        let finalRes;
        let resCode;
        let finalInfo;

        if (!err) {
          finalRes = res.data[0];
          resCode = SipFakeStack.parser.code(finalRes);
          finalInfo = null;

          if (['401', '407'].indexOf(resCode) !== -1) {
            finalInfo = 'Auth enabled, not accepted';
          } else if (resCode === '100') {
            finalInfo = 'Accepted';
          } else {
            finalInfo = `Auth disable, but not accepted, code: ${resCode}`;
          }

          // We only add valid extensions to final result
          if (finalInfo === 'Accepted') {
            partialResult = {
              fromExt,
              toExt,
              info: finalInfo,
              data: res.msg,
            };
            result.data.push(partialResult);
            logger.highlight(`Accepted: ${fromExt} => ${toExt}`);
          } else { // but we print info about tested ones
            logger.infoHigh(`${finalInfo} : ${fromExt} => ${toExt}`);
          }
          // Last element
          if (indexCountFrom === options.fromExt.length &&
            indexCountTo === options.toExt.length) {
            asyncCbTo();
          } else {
            setTimeout(asyncCbTo, options.delay);
          }
        } else {
          // We want to stop the full chain
          asyncCbTo(err);
        }
      });
    }, err => {
      asyncCbFrom(err);
    });
  }, err => {
    if (result.data.length === 0) {
      result.vulnerable = false;
    } else {
      result.vulnerable = true;
    }
    callback(err, result);
  });
};
