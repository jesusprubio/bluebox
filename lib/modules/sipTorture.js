//    Copyright Sergio Garcia <s3rgio.gr gmail com>
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

// TODO: IPv6, https://tools.ietf.org/rfc/rfc5118.txt
module.exports.help = {
  description: 'SIP Torture stress test (crafted packets, RFC 4475)',
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
  const result = {};
  // TODO: Add more
  // http://tools.ietf.org/html/rfc4475
  const tortureCfgs = [
    {
      id: '3121',
      name: 'Extraneous Header Field Separators',
      meth: 'INVITE',
      badSeparator: true,
    },
    {
      id: '3122',
      name: 'Content Length Larger Than Message',
      meth: 'INVITE',
      contentLen: '99999',
    },
    {
      id: '3123',
      name: 'Negative Content Length',
      meth: 'INVITE',
      contentLen: '-999',
    },
    {
      id: '3125',
      name: 'Response Scalar Fields with Overlarge Values',
      meth: 'INVITE',
      cseq: '9292394834772304023312',
    },
    {
      id: '31212',
      name: 'Invalid Time Zone in Date Header Field',
      meth: 'INVITE',
      sipDate: 'Fri, 01 Jan 2010 16:00:00 EST',
    },
    {
      id: '31216',
      name: 'Unknown Protocol Version',
      meth: 'INVITE',
      sipVersion: '7.0',
    },
    {
      id: '31218',
      name: 'Unknown method',
      meth: 'NEWMETHOD',
    },
    {
      id: '331',
      name: 'Missing Required Header Fields',
      meth: 'INVITE',
      badFields: true,
    },
    {
      id: '336',
      name: 'Unknown Content-Type',
      meth: 'INVITE',
      contentType: 'application/unknown',
    },
    {
      id: '3311',
      name: 'Max-Forwards of Zero',
      meth: 'INVITE',
      maxForwards: '0',
    },
    {
      id: '3315',
      name: 'Unacceptable Accept Offering',
      meth: 'OPTIONS',
      sipAccept: 'text/nobodyKnowsThis',
    },
  ];

  logger.infoHigh(`${options.target} : ${options.port} / ${options.transport}`);
  async.eachSeries(tortureCfgs, (tortureCfg, asyncCb) => {
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
    const fakeStack = new SipFakeStack(stackConfig);
    const msgConfig = tortureCfg;

    logger.highlight(`${tortureCfg.name} test ...`);

    fakeStack.send(msgConfig, (err, res) => {
      result[tortureCfg.name] = {};
      result[tortureCfg.name].id = tortureCfg.id;
      result[tortureCfg.name].data = err || res;

      asyncCb();
    });
  }, err => {
    callback(err, result);
  });
};
