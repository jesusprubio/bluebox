/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const requestP = require('request-promise');

const utils = require('../utils');
const defaultUa = require('../../cfg/uas').http;

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


function getPromise(rhost, credPair, action, opts) {
  return new Promise((resolve, reject) => {
    const result = { up: false, authed: false };
    const port = opts.rport || 80;
    const transport = opts.transport || 'http';
    let url = `${transport}://${rhost}:${port}`;

    if (opts.path) { url = `${url}/path`; }
    const cliOpts = {
      url,
      headers: { 'User-Agent': opts.ua || defaultUa },
      resolveWithFullResponse: true,
      timeout: opts.timeout || 5000,
    };

    // https://github.com/request/request#http-authentication
    const finalCreds = credPair || [];
    cliOpts.auth = { user: finalCreds[0] || '', pass: finalCreds[1] || '' };

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
        // TODO: Add an option because is too huge
        // body: res.body,
      };

      if (res.statusCode === 200) {
        dbg('Connected');
        result.up = true;
        result.authed = true;
      }

      if (!action) {
        resolve(result);
        return;
      }
    })
    .catch((err) => {
      if (err.statusCode) {
        result.up = true;
        result.data = {
          statusCode: err.statusCode,
          headers: err.response.headers,
          trailers: err.response.trailers,
          // TODO: Add an option because is too huge
          // body: res.body,
        };
        resolve(result);
      // Expected result, we dont want an error here.
      // } else if (utils.includes(validErr, err.cause.code)) {
      //   resolve(result);
      } else {
        reject(err);
      }
    });
  });
}


module.exports.map = (rhost, opts = {}) => getPromise(rhost, null, null, opts);


module.exports.brute = (rhost, credPair, opts = {}) => getPromise(rhost, credPair, null, opts);
