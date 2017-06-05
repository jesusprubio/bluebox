/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const Netmask = require('netmask').Netmask;
const utils = require('.');

const reservedIpsRegex = /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)/; // eslint-disable-line max-len


function addZeros(block) {
  if (block === '') {
    return '0';
  }

  return block;
}


// We export the full Object: https://github.com/rs/node-netmask
// TODO: review this, maybe better to encapsulate what we need.
// or even better to contribute there with what we have.
module.exports.Netmask = Netmask;


module.exports.randomIp = () => {
  const array = [];

  for (let i = 0; i <= 3; i += 1) {
    array.push(utils.random(1, 255));
  }
  return array.join('.');
};


module.exports.randomPort = () => utils.random(1025, 65535);


module.exports.isReservedIp = address => reservedIpsRegex.test(address);


module.exports.randomIp6 = () => {
  const array = [];

  for (let i = 0; i <= 7; i += 1) {
    array.push(this.randomString(4, 16));
  }

  return array.join(':');
};


module.exports.normalize6 = (add6) => {
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


// Needed by the "autoVoip" module
module.exports.createAutoTargets = (ips, customServices, sipTypes) => {
  const targets = [];

  // Getting all combinations
  utils.each(ips, (target) => {
    utils.each(customServices, (sipService) => {
      // All requeqs which the server could answer at
      utils.each(sipTypes, (meth) => {
        if (sipService.transport === 'WS' || sipService.transport === 'WSS') {
          utils.each(['', 'ws'], (wsPath) => {
            targets.push({
              ip: target,
              port: sipService.port,
              transport: sipService.transport,
              meth,
              wsPath,
            });
          });
        } else {
          targets.push({
            ip: target,
            port: sipService.port,
            transport: sipService.transport,
            meth,
          });
        }
      });
    });
  });

  return targets;
};
