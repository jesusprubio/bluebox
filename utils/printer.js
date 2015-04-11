/*
    Copyright Jesus Perez <jesusprubio gmail com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

// Private stuff

var clc = require('cli-color'),
    prettyjson = require('prettyjson');


// Public stuff

module.exports.regular = function (str) {
    process.stdout.write(str + '\n');
};

module.exports.info = function (str) {
    process.stdout.write(clc.xterm(55)(str) + '\n');
};

module.exports.infoHigh = function (str) {
    process.stdout.write(clc.xterm(63)(str) + '\n');
};

module.exports.highlight = function (str) {
    process.stdout.write(clc.xterm(202)(str) + '\n');
};

module.exports.result = function (str) {
    process.stdout.write(clc.xterm(46)(str) + '\n');
};

module.exports.json = function (json) {
    process.stdout.write(prettyjson.render(json, {
//        keysColor: 'rainbow',
//        dashColor: 'magenta',
//        stringColor: 'white'
    }) + '\n');
};

module.exports.error = function (str) {
    process.stdout.write(clc.red.bold(str) + '\n');
};

module.exports.bold = function (str) {
    process.stdout.write(clc.bold(str) + '\n');
};

module.exports.clear = function () {
    process.stdout.write(clc.reset);
};

module.exports.remove = function (pos) {
    process.stdout.write(clc.bol(-pos) + '\n');
};

module.exports.welcome = function (str) {
    process.stdout.write(clc.bold(clc.xterm(202)(str)) + '\n');
};
