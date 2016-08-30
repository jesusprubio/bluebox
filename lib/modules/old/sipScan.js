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
  description: 'SIP host/port scanner',
  options: {
    targets: {
      type: 'ips',
      description: 'Hosts to explore',
      defaultValue: '127.0.0.1',
      //defaultValue: '172.16.190.128'
    },
    // TODO: Coupled with the client
    // This order mandatory (between "transport" and "port" to try
    // to guess the porter when asking for the options
    transport: {
      type: 'transports',
      description: 'Underlying protocol',
      defaultValue: 'UDP',
    },
    ports: {
      type: 'ports',
      description: 'Ports to explore on chosen IPs',
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
      defaultValue: 'OPTIONS',
    },
    srcHost: {
      type: 'srcHost',
      description: 'Source host to include in the  SIP request ' +
                   '("external" and "random" supported)',
      defaultValue: 'iface:eth0',
      // defaultValue: 'iface:en0'
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

function getFingerPrint(msg) {
  const fingerprint = SipFakeStack.parser.server(msg) ||
    SipFakeStack.parser.userAgent(msg) ||
    SipFakeStack.parser.organization(msg);
  let ser;
  let ver;

  if (fingerprint) {
    ser = SipFakeStack.parser.service(fingerprint);
    ver = SipFakeStack.parser.version(fingerprint);
  }

  return {
    service: ser,
    version: ver,
  };
}


module.exports.run = (options, callback) => {
  const result = [];
  let indexCountHost = 0; // User with delay to know in which index we are
  let indexCountPort = 0;
  let hasAuth = false;

  async.eachSeries(options.targets, (target, asyncCbHost) => {
    indexCountHost += 1;
    indexCountPort = 0;
    async.eachSeries(options.ports, (port, asyncCbPort) => {
      // We use a new stack in each request to simulate different users
      const stackConfig = {
        server: target || null,
        port: port || '5060',
        transport: options.transport || 'UDP',
        timeout: options.timeout || 10000,
        wsPath: options.wsPath || null,
        srcHost: options.srcHost || null,
        lport: options.srcPort || null,
        domain: options.domain || null,
      };
      const fakeStack = new SipFakeStack(stackConfig);
      let finalMeth;

      if (options.meth === 'random') {
        finalMeth = SipFakeStack.utils.randSipReq();
      } else {
        finalMeth = options.meth;
      }

      const msgConfig = {
        meth: finalMeth,
      };

      indexCountPort += 1;
      fakeStack.send(msgConfig, (err, res) => {
        let parsedService;
        let partialResult;
        let finalRes;

        let msgString = `${stackConfig.server} : ${stackConfig.port} / ${stackConfig.transport}`;

        if (stackConfig.transport === 'WS' || stackConfig.transport === 'WSS') {
          msgString += ` ( WS path: ${stackConfig.wsPath} )`;
        }
        msgString += ` - ${msgConfig.meth}`;

        // We don't want to stop the full chain (if error)
        if (!err) {
          finalRes = res.data[0];

          parsedService = getFingerPrint(finalRes);
          if (['401', '407'].indexOf(SipFakeStack.parser.code(finalRes)) !== -1) {
            hasAuth = true;
          }
          partialResult = {
            host: stackConfig.server,
            port: stackConfig.port,
            transport: stackConfig.transport,
            meth: msgConfig.meth,
            auth: hasAuth,
            data: finalRes,
          };

          if (parsedService) {
            partialResult.service = parsedService.service;
            partialResult.version = parsedService.version;
          }

          result.push(partialResult);

          logger.highlight(`Response received: ${msgString}`);
        } else {
          logger.infoHigh(`Response NOT received: ${msgString}`);
        }

        // Last element
        if (indexCountHost === options.targets.length &&
          indexCountPort === options.ports.length) {
          asyncCbPort();
        } else {
          setTimeout(asyncCbPort, options.delay);
        }
      });
    }, err => {
      asyncCbHost(err);
    });
  }, err => {
    callback(err, result);
  });
};

