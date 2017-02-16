/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const path = require('path');

const shoot = require('../../../..').webShoot;


module.exports.desc = 'Take a screenshoot of a website.';


module.exports.opts = {
  url: {
    types: 'url',
    desc: 'URL to explore',
    default: 'http://example.com/',
  },
  path: {
    desc: 'Path to store the output file (relative to from where Bluebox was launched)',
    default: '.',
  },
  // TODO: Support this parameter in the method.
  // timeout: {
  //   types: 'natural',
  //   desc: 'Time to wait for a response, in ms.',
  //   default: 5000,
  // },
};


module.exports.impl = (opts = {}) => {
  const finalOpts = opts;

  // TODO: Output file name hardcoded for now, add an option.
  if (opts.path) {
    finalOpts.path =
      path.resolve(process.cwd(), opts.path, `shoot-${new Date().toISOString()}.png`);
  }
  return shoot(opts.url, finalOpts);
};
