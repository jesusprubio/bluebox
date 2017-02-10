/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const requestP = require('request-promise');

const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);

// TODO: Get from a config file (same for SIP, etc)
const defaultUa = 'bluebox-ng';


function getPromise(rhost, credPair, action, opts) {
  return new Promise((resolve, reject) => {
    const result = { connected: false };
    const port = opts.rport || 80;
    const transport = opts.transport || 'http';
    let url = `${transport}://${rhost}:${port}`;

    if (opts.path) { url = `${url}/path`; }
    const cliOpts = {
      url,
      headers: { 'User-Agent': opts.ua || defaultUa },
      resolveWithFullResponse: true,
    };

    // https://github.com/request/request#http-authentication
    if (credPair) { cliOpts.auth = { user: credPair[0], pass: credPair[1] }; }

    // TODO: vs. "basic"
    // if (opts.digest === true) { reqOpts.auth.sendImmediately = false; }

    dbg('HTTP request setup:', cliOpts);
    requestP(cliOpts)
    .then((res) => {
      dbg('HTTP response correctly received');
      if (!utils.isObject(res)) {
        reject(new Error('Not valid HTTP response'));

        return;
      }

      result.data = {
        statusCode: res.statusCode,
        headers: res.headers,
        trailers: res.trailers,
        body: res.body,
      };

      if (res.statusCode === 200) {
        dbg('Connected');
        result.connected = true;
      }

      if (!action) {
        resolve(result);
        return;
      }

      // TODO: ie: shoot with panthom
      // action()
      // .then()
      // .catch(err => reject(`Running the action: ${err.message}`));
    })
    .catch((err) => {
      if (utils.includes([401, 407], err.statusCode)) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}


module.exports.map = (rhost, opts = {}) => getPromise(rhost, null, null, opts);


module.exports.brute = (rhost, credPair, opts = {}) => getPromise(rhost, credPair, null, opts);

// TODO
// module.exports.post = (rhost, credPair, action, opts = {}) =>
//   getPromise(rhost, credPair, action, opts);


// TODO: Add also a method to make a DDoS for all protocols.
