// Copyright Jesus Perez <jesusprubio gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const clc = require('cli-color');
const prettyjson = require('prettyjson');


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
