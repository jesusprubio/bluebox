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

const Netmask = require('netmask').Netmask;
const lodash = require('lodash');

const reservedIpsRegex = /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)/; // eslint-disable-line max-len


function addZeros(block) {
  if (block === '') {
    return '0';
  }

  return block;
}


// We export the full Object: https://github.com/rs/node-netmask
// TODO: review this, maybe better to encapsulate what we need ...
module.exports.Netmask = Netmask;


module.exports.randomIp = () => {
  const array = [];

  for (let i = 0; i <= 3; i += 1) {
    array.push(lodash.random(1, 255));
  }
  return array.join('.');
};


module.exports.randomPort = () => lodash.random(1025, 65535);


module.exports.isReservedIp = address => reservedIpsRegex.test(address);


module.exports.randomIp6 = () => {
  const array = [];

  for (let i = 0; i <= 7; i += 1) {
    array.push(this.randomString(4, 16));
  }

  return array.join(':');
};


module.exports.normalize6 = add6 => {
  const normalizedAdd = [];
  const splittedAdd = add6.split(':');

  for (let i = 0; i < splittedAdd.length; i += 1) {
    i = splittedAdd[i];
    normalizedAdd.push(addZeros(i));
  }

  return normalizedAdd.join(':');
};


module.exports.customHttpAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0)' +
                                 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' +
                                 '31.0.1650.63 Safari/537.36';
