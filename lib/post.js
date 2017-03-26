/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('./utils');

const Promise = utils.Promise;
const protocols = utils.requireDir(module, './protocols');
const dbg = utils.dbg(__filename);

const defaultOpts = {
  proto: 'http',
  transport: 'http', // vs https
  port: 8080,
  timeout: 5000,
};


// TODO: Add to the documentation
module.exports = (ip, action, opts = {}) =>
  new Promise((resolve, reject) => {
    dbg(`Starting, IP: "${ip}", options`, opts);
    const optsC = utils.defaults(opts, defaultOpts);
    dbg('Final options', optsC);
    let credPair = null;
    if (opts.user) { credPair = [opts.user, opts.password]; }

    protocols[optsC.proto].post(ip, credPair, action, optsC).delay(optsC.delay)
    .then((res) => {
      dbg('Response received');
      // Each one can return a different object, so left it as it comes.
      resolve(res);
    })
    .catch(err => reject(err));
  });
