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

/* eslint new-cap: ["error", { "capIsNewExceptions": ["Question", "Request"] }]*/
'use strict';


const dns = require('native-dns');
const async = require('async');

module.exports.help = {
  description: 'Resolve common VoIP DNS registers (SRV, NAPTR)' +
               'for an specific domain',
  options: {
    domain: {
      type: 'domain',
      description: 'domain to explore',
      defaultValue: 'google.com',
    },
    server: {
      type: 'ip',
      description: 'DNS server to make the request on',
      defaultValue: '87.216.170.85',
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response (ms.)',
      defaultValue: 5000,
    },
  },
};

const REQ_TYPES = [
  'SOA',
  'A',
  'AAAA',
  'MX',
  'TXT',
  'SRV',
  'NS',
  'CNAME',
  'PTR',
  'NAPTR',
];


module.exports.run = (options, callback) => {
  const result = [];

  // We use limit to control Node.js powers
  // (avoid socket problems, etc.)
  async.eachLimit(REQ_TYPES, 5, (reqType, asyncCb) => {
    const question = dns.Question({
      name: options.domain,
      type: reqType,
    });
    const req = dns.Request({
      question,
      server: {
        address: options.server,
        port: 53,
        type: 'udp',
      },
      timeout: options.timeout,
    });
    let res = [];

    req.on('timeout', () => {
      asyncCb({
        type: 'Timeout',
      });
    });

    req.on('message', (err, answer) => {
      if (answer.answer) {
        res = answer.answer;
      }
    });

    req.on('end', () => {
      result.push({
        type: reqType,
        res,
      });
      asyncCb();
    });

    req.send();
  }, err => {
    callback(err, result);
  });
};
