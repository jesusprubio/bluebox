/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
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
    const result = { connected: false };
    const stackCfg = utils.defaults(opts, defaultOpts);
    stackCfg.server = rhost;
    // In the stack the var name is different.
    stackCfg.port = stackCfg.rport;
    if (stackCfg.lhost) { stackCfg.srcHost = stackCfg.lhost; }
    if (stackCfg.lport) { stackCfg.srcPort = stackCfg.lhost; }
    // "wsPath" and "domain" would come with the proper field names.

    const fakeStack = new SipFakeStack(stackCfg);

    fakeStack.send({ meth: opts.meth || 'OPTIONS' }, (err, res) => {
      // We don't want to stop the full chain (if error)
      if (err) {
        reject(err);
        return;
      }

      // TODO: Why 0¿
      // TODO: Parse here?
      // https://github.com/jesusprubio/bluebox-ng/blob/master/lib/modules/sipScan.js#L156
      result.data = res.data[0];

      resolve(result);
    });
  });


module.exports.brute = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { connected: false };
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

      if (res.data.valid) { result.connected = true; }
      // TODO: Confirm.
      result.data = res.data;
      resolve(result);
    });
  });


// ie: action = new namiLib.Actions.ListCommands();
// module.exports.post =
  // (rhost, credPair, action, opts = {}) => getPromise(rhost, credPair, action, opts);
