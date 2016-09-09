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

/* eslint no-mixed-operators: ["error", {"allowSamePrecedence": true}] */

// Public methods:
// - Receive a string
// - Return the final params needed by the module
// - Should throw an error if not passing the check
// - The error must include hints about a correct input

'use strict';


const net = require('net');
const fs = require('fs');
const path = require('path');

const Netmask = require('netmask').Netmask;
const sipUtils = require('sip-fake-stack').utils;
const utils = require('./');
const networkUtils = require('./network');
const errMsgs = require('./errorMsgs').types;


const transports = ['UDP', 'TCP', 'TLS', 'WS', 'WSS'];


function isPositiveInt(value) {
  return ((value === 0 || (value || 0) > 0) && value % 1 === 0);
}


module.exports.positiveInt = (value) => {
  if (isPositiveInt(value)) { return parseInt(value, 10); }

  throw new Error(errMsgs.positiveInt);
};


function isFloat(value) {
  return ((!isNaN(value) && value.toString().indexOf('.') !== -1));
}

module.exports.float = (value) => {
  if (isFloat(value)) { return parseFloat(value); }

  throw new Error(errMsgs.float);
};


function isPort(value) {
  return (isPositiveInt(value) && (parseInt(value, 10) > 0) && (parseInt(value, 10) <= 65535));
}


module.exports.port = (value) => {
  if (isPort(value)) { return parseInt(value, 10); }

  throw new Error(errMsgs.port);
};


// Needed by the "autoVoip" module
module.exports.isDomain = (value) => {
  const reDomain = /^([a-zA-Z0-9\-]{0,63}\.)+[a-zA-Z0-9]{2,}$/;

  return reDomain.test(value.toString());
};


module.exports.domain = (value) => {
  if (this.isDomain(value)) {
    return value;
  }

  throw new Error(errMsgs.domain);
};


module.exports.host = (value) => {
  if (this.isDomain(value)) {
    return value;
  }
  if (net.isIP(value)) {
    return value;
  }

  throw new Error(errMsgs.host);
};


module.exports.ip = (value) => {
  if (net.isIP(value)) {
    return value;
  }

  throw new Error(errMsgs.ip);
};


module.exports.networkProtocol = (value) => {
  const protocols = transports;
  const finalValue = value.toUpperCase();

  if (protocols.indexOf(finalValue) !== -1) { return finalValue; }

  throw new Error(protocols.toString());
};


function isCidrMask(value, version) {
  const finalValue = parseInt(value, 10);
  let min;
  let max;

  if (version === 4) {
    min = 0;
    max = 32;
  } else {
    min = 8;
    max = 128;
  }

  if ((min <= finalValue) && (finalValue <= max)) { return true; }

  return false;
}


function isIpBlock(value, version) {
  let raddix;
  let min;
  let max;

  if (version === 4) {
    raddix = 10;
    min = 0;
    max = 255;
  } else {
    raddix = 16;
    min = parseInt('0000', 16);
    max = parseInt('ffff', 16);
  }

  const finalValue = parseInt(value, raddix);

  if ((min <= finalValue) && (finalValue <= max)) { return true; }

  return false;
}


// To use with https://github.com/jas-/node-libnmap
module.exports.nmapTargets = (value) => {
  const split0 = value.split('/');
  const split1 = value.split('-');

  if (((split0.length === 2 && net.isIP(split0[0])) && isCidrMask(split0[1])) ||
     (split1.length === 2 && isIpBlock(split1[1])) || net.isIP(value)) {
    return value;
  }

  throw new Error(errMsgs.nmap.targets);
};


module.exports.nmapPorts = (value) => {
  const split0 = value.split(',');
  const split1 = value.split('-');

  if (split0.length > 1) {
    return value;
  } else if (split1.length === 2) {
    return value;
  } else if (isPort(value)) {
    return value;
  }

  throw new Error(errMsgs.nmap.ports);
};


// To avoid problems using falsy values
module.exports.allValid = (value) => value;


module.exports.yesNo = (value) => {
  if (value === 'yes' || value === 'no') {
    if (value === 'yes') { return true; }

    return false;
  }

  throw new Error(errMsgs.yesNo);
};


function padNumber(number, padding) {
  return new Array(Math.max(padding - String(number).length + 1, 0)).join(0) + number;
}


module.exports.userPass = (value) => {
  let finalValues = [];

  if (value.slice(0, 6) === 'range:') {
    const slicedValue = value.slice(6);
    const splitted = slicedValue.split('-');
    const init = parseInt(splitted[0], 10);
    const last = parseInt(splitted[1], 10);
    for (let i = init; i <= last; i += 1) {
      finalValues.push(padNumber(i, splitted[0].length));
    }
  } else if (value.slice(0, 5) === 'file:') {
    const slicedValue = value.slice(5);

    const data = fs.readFileSync(path.resolve(__dirname, '../', slicedValue));
    if (!data) {
      throw new Error(`${errMsgs.readFile} : "${slicedValue}"`);
    }

    finalValues = data.toString().split('\n');
  } else {
    finalValues = [value];
  }

  return finalValues;
};


module.exports.transports = (value) => {
  const protocols = transports;
  const finalValue = value.toUpperCase();

  if (protocols.indexOf(finalValue) !== -1) { return finalValue; }

  throw new Error(protocols.toString());
};


module.exports.sipRequests = (value) => {
  const types = sipUtils.getSipReqs();

  if (types.indexOf(value) !== -1) { return value; }

  throw new Error(types.toString());
};


// Get the IP address from a network interface value
// Returns a promise (depending of the value) to get
// an IP address.
// TODO: Promises still not supported.
// module.exports.srcHost = utils.Promise.method(value => {
//   console
//   debug(`Entering "srcHost", parsing value "${value}"`);
//
//   if (value.slice(0, 6) === 'iface:') {
//     debug('Getting the IP from an iface ...');
//     const ipAdd = value.slice(0, 6);
//
//     // "localIp" is already a promise.
//     return localIp(ipAdd);
//   } else if (value === 'external') {
//     debug('Getting the external IP ...');
//
//     // "request" is also a promise but we need to change the result,
//     return new Promise(rsl => {
//       request('http://icanhazip.com/')
//       .then(body => {
//         debug(`Request finished, body: ${body}`);
//         // Removing the ending '\n'
//         const parsed = body.substr(0, body.length - 1);
//         debug(`Parsed response: ${parsed}`);
//         rsl(parsed);
//       });
//     });
//   } else if (value === 'random') {
//     // This was the stack is going to random it.
//     // TODO: Change this crap when we use another stack.
//     debug('random');
//
//     return null;
//   }
//
//   debug('Common ip check');
//   // General case: a single IP.
//   // We need to return a promise also here.
//   return utils.Promise.method(ip(value));
//   // return ip(value);
// });


module.exports.srcPort = (value) => {
  if (value === 'real') {
    return null;
  } else if (value === 'random') {
    return networkUtils.randomPort();
  }

  return this.port(value);
};


module.exports.domainIp = (value) => {
  // The fake SIP stack is goint to use the target if not provided
  if (value === 'ip') { return null; }

  return this.domain(value);
};


function ipsCidr(value) {
  const splitValue = value.split('/');

  if ((net.isIPv4(splitValue[0]) && isCidrMask(splitValue[1], 4)) ||
      (net.isIPv6(splitValue[0]) && isCidrMask(splitValue[1], 6))) {
    const block = new Netmask(value);

    if (net.isIPv4(splitValue[0])) {
      const finalIps = [];
      block.forEach((ipAdd) => { finalIps.push(ipAdd); });

      return finalIps;
    }

    throw new Error(errMsgs.notV6);
  }

  throw new Error(errMsgs.ipsCidr);
}


function ipsRange(value) {
  const splitValue = value.split('-');
  const finalIps = [];
  let blockBase = '';
  let radix;
  let separator;

  // TODO: Not supported in ranges for now
  if (net.isIPv6(splitValue[0])) {
    throw new Error(errMsgs.notV6);
  }
  if ((net.isIPv4(splitValue[0]) && isIpBlock(splitValue[1], 4)) ||
      (net.isIPv6(splitValue[0]) && isIpBlock(splitValue[1], 6))) {
    if (net.isIPv4(splitValue[0])) {
      separator = '.';
      radix = 10;
    } else {
      separator = ':';
      radix = 16;
    }

    const splitted0 = splitValue[0].split(separator);
    for (let i = 0; i < (splitted0.length - 1); i += 1) {
      blockBase += splitted0[i].toString() + separator;
    }
    const blockMin = parseInt(splitted0[splitted0.length - 1], radix);
    const blockMax = parseInt(splitValue[1], radix);
    for (let i = blockMin; i <= blockMax; i += 1) {
      finalIps.push(blockBase + parseInt(i.toString(radix), 10));
    }

    return finalIps;
  }

  throw new Error(errMsgs.ipsRange);
}


module.exports.ips = (value) => {
  if (value.slice(0, 5) === 'file:') {
    const slicedValue = value.slice(5);

    const data = fs.readFileSync(path.resolve(__dirname, '../', slicedValue));
    if (!data) {
      throw new Error(`${errMsgs.readFile} : "${slicedValue}"`);
    }

    return data.toString().split('\n');
  } else if (value.split('/').length === 2) {
    return ipsCidr(value);
  } else if (value.split('-').length === 2) {
    return ipsRange(value);
  }

  return [this.ip(value)];
};


function portRange(value) {
  const splitValue = value.split('-');
  const finalPorts = [];

  if (isPort(splitValue[0]) && isPort(splitValue[1])) {
    for (let i = parseInt(splitValue[0], 10); i <= parseInt(splitValue[1], 10); i += 1) {
      finalPorts.push(parseInt(i, 10));
    }

    return finalPorts;
  }

  throw new Error(errMsgs.portRange);
}


function portList(value) {
  const splitedPorts = value.split(',');
  let finalPorts = [];

  utils.each(splitedPorts, (singlePort) => {
    if (singlePort.split('-').length === 2) {
      finalPorts = finalPorts.concat(portRange(singlePort));
    } else {
      finalPorts.push(this.port(singlePort));
    }
  });

  return finalPorts;
}


module.exports.ports = (value) => {
  const finalValue = value.toString();

  if (finalValue.split(',').length > 1) {
    return portList(value);
  } else if (finalValue.split('-').length === 2) {
    return portRange(finalValue);
  }

  return [this.port(finalValue)];
};


module.exports.ipsDomain = (value) => {
  try {
    return this.domain(value);
  } catch (e) {
    return this.ips(value);
  }
};


module.exports.bruteProto = (value) => {
  try {
    return this.domain(value);
  } catch (e) {
    return this.ips(value);
  }
};


// TODO: Export in wushu and take here.
const bruteProtos = ['ssh'];

module.exports.bruteProto = (value) => {
  const finalValue = value.toLowerCase();

  if (bruteProtos.indexOf(finalValue) !== -1) { return finalValue; }

  throw new Error(bruteProtos.toString());
};
