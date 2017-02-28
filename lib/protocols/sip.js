/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

// https://github.com/jesusprubio/sip-fake-stack
const SipFakeStack = require('sip-fake-stack');

const utils = require('../utils');

const Promise = utils.Promise;
const defaultOpts = {
  rport: 5060,
  transport: 'UDP',
  timeout: 10000,
};


module.exports.map = (rhost, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false };
    const stackCfg = utils.defaults(opts, defaultOpts);
    stackCfg.server = rhost;
    // In the stack the var name is different.
    stackCfg.port = stackCfg.rport;
    // TODO: Add support for "real" in the stack.
    if (opts.lhost) { stackCfg.srcHost = opts.lhost; }
    if (opts.lport) { stackCfg.srcPort = opts.lport; }
    if (opts.fromExt) { stackCfg.fromExt = opts.fromExt; }
    // "wsPath" and "domain" would come with the proper field names.
    // TODO: temporal fix, until we add the SIP fake stack code here.

    const fakeStack = new SipFakeStack(stackCfg);
    const msgCfg = { meth: opts.meth || 'OPTIONS' };

    if (opts.fromExt) { msgCfg.fromExt = opts.fromExt; }
    if (opts.toExt) { msgCfg.fromExt = opts.toExt; }

    fakeStack.send(msgCfg, (err, res) => {
      // We don't want to stop the full chain (if error)
      if (err) {
        reject(err);
        return;
      }

      result.up = true;
      // TODO: Why 0¿
      // TODO: Parse here?
      // https://github.com/jesusprubio/bluebox-ng/blob/master/lib/modules/sipScan.js#L156
      if (res.data && res.data[0]) {
        result.data = res.data[0];
        result.code = SipFakeStack.parser.code(result.data);
      }

      resolve(result);
    });
  });


module.exports.brute = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { up: false, authed: false };
    const stackCfg = utils.defaults(opts, defaultOpts);
    stackCfg.server = rhost;

    const fakeStack = new SipFakeStack(stackCfg);
    const msgCfg = {
      meth: opts.meth || 'REGISTER',
      fromExt: credPair[0] || 'anonymous',
      pass: credPair[1] || 'anonymous',
    };

    fakeStack.authenticate(msgCfg, (err, res) => {
      // We don't want to stop the full chain (if error)
      if (err) {
        reject(err);
        return;
      }

      if (res.data.valid) {
        result.authed = true;
      }
      // TODO: Confirm.
      result.data = res.data;
      resolve(result);
    });
  });


// ie: action = new namiLib.Actions.ListCommands();
// module.exports.post =
  // (rhost, credPair, action, opts = {}) => getPromise(rhost, credPair, action, opts);
