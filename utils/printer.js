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

var clc        = require('cli-color'),
    prettyjson = require('prettyjson');


// Public functions

module.exports.regular = function (str) {
    console.log(str);
};
        
module.exports.info = function (str) {
    console.log(clc.xterm(55)(str));
};
        
module.exports.infoHigh = function (str) {
    console.log(clc.xterm(63)(str));
};

module.exports.highlight = function (str) {
    console.log(clc.xterm(202)(str));
};

// TODO: Some beautifull JSON printer
module.exports.result = function (str) {
    console.log(clc.xterm(46)(str));
};

module.exports.json = function (json) {
    console.log(prettyjson.render(json, {
//        keysColor: 'rainbow',
//        dashColor: 'magenta',
//        stringColor: 'white'
    }));
};

module.exports.error = function (str) {
    console.log(clc.red.bold(str));
};

module.exports.bold = function (str) {
    console.log(clc.bold(str));
};

module.exports.clear = function () {
    console.log(clc.reset);
};

module.exports.remove = function (pos) {
    console.log(clc.bol(-pos));
};