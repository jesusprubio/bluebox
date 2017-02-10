/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const clc = require('cli-color');
const prettyjson = require('prettyjson');

// TODO:
// - https://github.com/dthree/vorpal/wiki/api-%7C-vorpal.ui#uiredrawdone

/* eslint-disable no-console */
module.exports.regular = str => console.log(str);

module.exports.info = str => console.log(clc.xterm(55)(str));

module.exports.infoHigh = str => console.log(clc.xterm(63)(str));

module.exports.highlight = str => console.log(clc.xterm(202)(str));

module.exports.result = str => console.log(clc.xterm(46)(str));

module.exports.json = json => console.log(prettyjson.render(json));

module.exports.error = str => console.log(clc.red.bold(str));

module.exports.bold = str => console.log(clc.bold(str));

module.exports.clear = () => process.stdout.write(clc.reset());

module.exports.welcome = str => console.log(clc.bold.xterm(202)(str));
/* eslint-enable no-console */
