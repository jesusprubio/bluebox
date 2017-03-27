/*
  Copyright Sergio García <s3rgio.gr@gmail.com>
            Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const optsBrute = require('../../../cfg/commonOpts/bruteCred');
const optsSip = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');
const logger = require('../../../bin/utils/logger');
const proto = require('../../../lib/protocols/sip');

// TODO: Add more
// http://tools.ietf.org/html/rfc4475
const tortures = [
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
const optsComm = {};
utils.defaultsDeep(optsComm, optsBrute, optsSip);
optsComm.rport.default = 5060;
optsComm.concurrency.default = proto.concurrency;
delete optsComm.passwords;
delete optsComm.userAssPass;
delete optsComm.delay;


module.exports.desc = 'Check if the server is blocking crafted packets' +
                      'SIP Torture stress test (RFC 4475).';

module.exports.opts = optsComm;


module.exports.impl = (opts = {}) => {
  const request = tortureCfg =>
    new Promise((resolve, reject) => {
      const cfg = {};
      utils.defaultsDeep(cfg, tortureCfg, optsSip);

      logger.info(`${tortureCfg.name} test ...`);

      proto.map(cfg.rhost, cfg)
      .then((res) => {
        resolve({
          id: cfg.id,
          name: cfg.name,
          code: proto.parsers.code(res.data.response),
          data: res.data,
        });
      })
      .catch(err => reject(err));
    });

  return utils.pMap(tortures, request, { concurrency: opts.concurrency });
};
