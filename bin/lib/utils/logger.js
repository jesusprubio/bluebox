/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const clc = require('cli-color');
const prettyjson = require('prettyjson');

// TODO: Move to "utils.js"?

module.exports.regular = str => process.stdout.write(`${str}\n`);

module.exports.info = str => process.stdout.write(`${clc.xterm(55)(str)}\n`);

module.exports.infoHigh = str => process.stdout.write(`${clc.xterm(63)(str)}\n`);

module.exports.highlight = str => process.stdout.write(`${clc.xterm(202)(str)}\n`);

module.exports.result = str => process.stdout.write(`${clc.xterm(46)(str)}\n`);

module.exports.json = json => process.stdout.write(`${prettyjson.render(json)}\n`);

module.exports.error = str => process.stdout.write(`${clc.red.bold(str)}\n`);

module.exports.bold = str => process.stdout.write(`${clc.bold(str)}\n`);

module.exports.clear = () => process.stdout.write(clc.reset());

module.exports.welcome = str => process.stdout.write(`${clc.bold.xterm(202)(str)}\n`);
