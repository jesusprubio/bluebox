/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const optsBase = require('../../../cfg/commonOpts/base');
const optsSip = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');
const proto = require('../../../lib/protocols/sip');

const optsComm = {};
utils.defaultsDeep(optsComm, optsBase, optsSip);
optsComm.rport.default = 5060;


module.exports.desc = 'Check if the server is blocking crafted packets (SQLi)).';


module.exports.opts = optsComm;


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    const result = {
      blocking: false,
      auth: false,
    };
    const cfg = utils.cloneDeep(opts);

    cfg.method = 'INVITE';
    cfg.sqli = true;

    proto.auth(cfg.rhost, ['nonexistent', 'nonexistent'], cfg)
    .then((res) => {
      if (utils.includes(['407', '401'], proto.parsers.code(res.data.response))) {
        result.auth = true;
      }

      result.data = res.data;
      resolve(result);
    })
    .catch((err) => {
      // TODO: Confirm this works.
      if (err.second) {
        resolve({
          blocking: true,
          data: err,
        });
      } else {
        reject(err);
      }
    });
  });
