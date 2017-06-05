/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruter = require('../../../lib/bruter');
const optsBrute = require('../../../cfg/commonOpts/bruteCred');
const optsSip = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');
const proto = require('../../../lib/protocols/sip');

const dbg = utils.dbg(__filename);

const optsComm = {};
utils.defaultsDeep(optsComm, optsBrute, optsSip);
optsComm.rport.default = 5060;
optsComm.concurrency.default = proto.concurrency;

// We reuse the brute method but it's simpler here, so we don't
// need these options.
delete optsComm.passwords;
delete optsComm.userAssPass;


module.exports.desc = 'SIP extension brute-force (CVE-2009-3727/AST-2009-008,' +
                      'CVE-2011-2536/AST-2011-011) and others.';

module.exports.opts = optsComm;


// We can't reuse the "brute" implementation here, we should
// complicate it a lot.
module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    dbg('Starting, opts', opts);
    // TODO: Add as a parameter
    const nonExistentExt = 'inexistentext';
    const checkOpts = utils.cloneDeep(opts);
    const result = {
      vunerable: false,
      auth: true,
    };

    checkOpts.fromExt = nonExistentExt;
    checkOpts.toExt = nonExistentExt;

    dbg('Sending', checkOpts);
    proto.map(opts.rhost, checkOpts)
    .then((res) => {
      dbg('Response received', { nonExistentExt, code: res.code });

      if (res && res.code && utils.includes(['401', '407', '200'], res.code)) {
        if (res.code === '200') {
          result.auth = false;
        }
        resolve(result);
        return;
      }

      if (res.code) {
        result.codeBase = res.code;
        dbg(`Default code: ${res.code}`);
      }

      result.vulnerable = true;

      if (opts.onlyCheck) {
        resolve(result);
        return;
      }

      const optsParsed = utils.cloneDeep(opts);
      optsParsed.iter1 = optsParsed.users;
      delete optsParsed.users;
      // We need it in the "proto.enum" method.
      optsParsed.codeBase = result.codeBase;

      bruter(optsParsed.rhost, proto.enum, optsParsed)
      .then((resB) => {
        result.valids = resB;

        resolve(result);
      })
      .catch(err => reject(err));
    })
    .catch(err => reject(err));
  });
