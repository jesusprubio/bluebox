/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

// https://github.com/jesusprubio/sip-fake-stack
const SipFakeStack = require('sip-fake-stack');

const utils = require('../utils');

const defaultOpts = {
  rport: 5060,
  transport: 'UDP',
  timeout: 10000,
};

const msgOpts = [
  'fromExt', 'toExt',
  // Torture ones.
  'badSeparator', 'contentLen', 'cseq', 'sipDate', 'sipVersion',
  'meth', 'badFields', 'contentType', 'maxForwards', 'sipAccept',
  'sqli', 'user', 'pass',
];


function fingerprint(msg) {
  let ser;
  let ver;
  const result = {};

  const print = SipFakeStack.parser.server(msg) ||
                SipFakeStack.parser.userAgent(msg) ||
                SipFakeStack.parser.organization(msg);

  if (print) {
    ser = SipFakeStack.parser.service(print);
    ver = SipFakeStack.parser.version(print);
  }

  if (ser) { result.service = ser; }
  if (ver) { result.version = ver; }

  return result;
}


function request(rhost, opts = {}) {
  return new Promise((resolve, reject) => {
    const result = { up: false };
    const stackCfg = utils.defaults(opts, defaultOpts);
    stackCfg.server = rhost;
    // In the stack the var name is different.
    stackCfg.port = stackCfg.rport;
    // TODO: Add support for "real" in the stack.
    if (opts.lhost) { stackCfg.srcHost = opts.lhost; }
    if (opts.lport) { stackCfg.srcPort = opts.lport; }
    // "wsPath" and "domain" would come with the proper field names.
    // TODO: temporal fix, until we add the SIP fake stack code here.

    const fakeStack = new SipFakeStack(stackCfg);
    const msgCfg = {};

    utils.each(Object.keys(opts), (optName) => {
      if (utils.includes(msgOpts, optName)) { msgCfg[optName] = opts[optName]; }
    });

    fakeStack.send(msgCfg, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      result.up = true;
      // TODO: Why 0¿
      // TODO: Parse here?
      // https://github.com/jesusprubio/bluebox-ng/blob/master/lib/modules/sipScan.js#L156
      if (res.data && res.data[0]) {
        result.data = {
          raw: res.data[0],
          code: SipFakeStack.parser.code(result.data),
        };

        const servicePrint = fingerprint(res.data[0]);

        if (!utils.isEmpty(Object.keys(servicePrint))) {
          result.data.fingerprint = servicePrint;
        }
      }

      resolve(result);
    });
  });
}


module.exports.map = request;


module.exports.auth = (rhost, credPair, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { done: false };
    const stackCfg = utils.defaults(opts, defaultOpts);
    stackCfg.server = rhost;

    const fakeStack = new SipFakeStack(stackCfg);
    const msgCfg = {};

    utils.each(Object.keys(opts), (optName) => {
      if (utils.includes(msgOpts, optName)) { msgCfg[optName] = opts[optName]; }
    });

    fakeStack.authenticate(msgCfg, (err, res) => {
      // We don't want to stop the full chain (if error)
      if (err) {
        reject(err);
        return;
      }

      if (res.data.valid) {
        result.done = true;
      }
      // TODO: Confirm.
      result.data = res.data;
      resolve(result);
    });
  });


module.exports.enum = (rhost, extension, opts) =>
  new Promise((resolve, reject) => {
    const result = { done: false };
    const optsParsed = opts;

    optsParsed.fromExt = extension;
    // TODO: Sure better in this way?
    optsParsed.toExt = extension;

    request(rhost, optsParsed)
    .then((res) => {
      if (res && res.code && res.code !== optsParsed.codeBase) { result.done = true; }

      resolve(result);
    })
    .catch(err => reject(err));
  });


module.exports.checkCall = (rhost, extensions, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = { done: false };
    const optsParsed = opts;

    optsParsed.meth = 'INVITE';
    optsParsed.fromExt = extensions[0];
    optsParsed.toExt = extensions[1];

    request(rhost, optsParsed)
    .then((res) => {
      if (res && res.code && utils.includes(['401', '407'], res.code)) { result.done = true; }

      resolve(result);
    })
    .catch(err => reject(err));
  });


// To be used as the default in this protocol related modules.
// We have the control of this library so we can take more "risk" here.
module.exports.concurrency = 10000;


module.exports.parsers = SipFakeStack.parser;


// ie: action = new namiLib.Actions.ListCommands();
// module.exports.post =
  // (rhost, credPair, action, opts = {}) => getPromise(rhost, credPair, action, opts);
