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

'use strict';


const net = require('net');
const fs = require('fs');
const path = require('path');

const lodash = require('lodash');

// TODO: Get from utils
const Netmask = require('netmask').Netmask;
const sipUtils = require('sip-fake-stack').utils;
const networkUtils = require('./network');

const transports = ['UDP', 'TCP', 'TLS', 'WS', 'WSS'];


function isPositiveInt(value) {
  return ((value === 0 || (value || 0) > 0) && value % 1 === 0);
}


function isFloat(value) {
  return ((!isNaN(value) && value.toString().indexOf('.') !== -1));
}


function isDomain(value) {
  const reDomain = /^([a-zA-Z0-9\-]{0,63}\.)+[a-zA-Z0-9]{2,}$/;

  return reDomain.test(value.toString());
}


function isPort(value) {
  return (isPositiveInt(value) && (parseInt(value, 10) > 0) && (parseInt(value, 10) <= 65535));
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


function ip(value) {
  if (net.isIP(value)) {
    return value;
  }

  throw new Error('Any valid IPv4/IPv6 single address');
}


function port(value) {
  if (isPort(value)) {
    return parseInt(value, 10);
  }

  throw new Error('Any valid port (0..65535)');
}

function domain(value) {
  if (isDomain(value)) {
    return value;
  }

  throw new Error('ie: google.com, www.google.com');
}

function host(value) {
  if (isDomain(value)) {
    return value;
  }
  if (net.isIP(value)) {
    return value;
  }

  throw new Error('Any valid host (Domain or IPv4/IPv6 single address)');
}


function padNumber(number, padding) {
  return new Array(Math.max(padding - String(number).length + 1, 0)).join(0) + number;
}

function userPass(value) {
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
      throw new Error(`Reading file: "${slicedValue}"`);
    }

    finalValues = data.toString().split('\n');
  } else {
    finalValues = [value];
  }

  return finalValues;
}

function ipsRange(value) {
  const splitValue = value.split('-');
  const finalIps = [];
  let blockBase = '';
  let radix;
  let separator;

  // TODO: Not supported in ranges for now
  if (net.isIPv6(splitValue[0])) {
    throw new Error('IPv6 still not supported for ranges');
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

  throw new Error('ie: 192.168.0.1-5 (only last block supported for now)');
}


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

    throw new Error('IPv6 still not supported for CIDR');
  }

  throw new Error('ie: 192.168.0.0/24, 2001:0C00::/32');
}


function ips(value) {
  if (value.slice(0, 5) === 'file:') {
    const slicedValue = value.slice(5);

    const data = fs.readFileSync(path.resolve(__dirname, '../', slicedValue));
    if (!data) {
      throw new Error(`Reading file: "${slicedValue}"`);
    }

    return data.toString().split('\n');
  } else if (value.split('/').length === 2) {
    return ipsCidr(value);
  } else if (value.split('-').length === 2) {
    return ipsRange(value);
  }

  return [ip(value)];
}


function portRange(value) {
  const splitValue = value.split('-');
  const finalPorts = [];

  if (isPort(splitValue[0]) && isPort(splitValue[1])) {
    for (let i = parseInt(splitValue[0], 10); i <= parseInt(splitValue[1], 10); i += 1) {
      finalPorts.push(parseInt(i, 10));
    }

    return finalPorts;
  }

  throw new Error('ie: 5060-5065');
}


function portList(value) {
  const splitedPorts = value.split(',');
  let finalPorts = [];

  lodash.each(splitedPorts, (singlePort) => {
    if (singlePort.split('-').length === 2) {
      finalPorts = finalPorts.concat(portRange(singlePort));
    } else {
      finalPorts.push(port(singlePort));
    }
  });

  return finalPorts;
}


// Public stuff, from here:
// - Receive a string
// - Return the final params needed by the module
// - Should throw an error if not passing the check
//      - TODO: Better a callback here?
// - The error must include hints about a correct input

module.exports.positiveInt = (value) => {
  if (isPositiveInt(value)) { return parseInt(value, 10); }

  throw new Error('Any positive integer');
};


module.exports.float = (value) => {
  if (isFloat(value)) { return parseFloat(value); }

  throw new Error('Any float');
};


module.exports.domain = domain;


module.exports.port = port;


module.exports.ip = ip;

module.exports.host = host;

module.exports.networkProtocol = (value) => {
  const protocols = transports;
  const finalValue = value.toUpperCase();

  if (protocols.indexOf(finalValue) !== -1) { return finalValue; }

  throw new Error(protocols.toString());
};


// To use with https://github.com/jas-/node-libnmap
module.exports.nmapTargets = (value) => {
  const split0 = value.split('/');
  const split1 = value.split('-');

  if (((split0.length === 2 && net.isIP(split0[0])) && isCidrMask(split0[1])) ||
     (split1.length === 2 && isIpBlock(split1[1])) || net.isIP(value)) {
    return value;
  }

  throw new Error('Single hostname ipv4 (still not ipv6), a CIDR or a' +
                  'numerical range (ie: 192.168.0.0/24, 192.168.1.1-5');
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

  throw new Error('ie: 21,22,80,443,3306,60000-65535');
};


// To avoid problems using falsy values
module.exports.allValid = (value) => value;


module.exports.yesNo = (value) => {
  if (value === 'yes' || value === 'no') {
    if (value === 'yes') { return true; }

    return false;
  }

  throw new Error('valid: yes | no');
};


module.exports.userPass = userPass;


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
module.exports.srcHost = (value) => {
  // the "parseOptions" (in "common.js" file) method will
  // get the final value
  if (value.slice(0, 6) === 'iface:') {
    return value;
  } else if (['random', 'external'].indexOf(value) !== -1) {
    return value;
  }

  return ip(value);
};


module.exports.srcPort = (value) => {
  if (value === 'real') {
    return null;
  } else if (value === 'random') {
    return networkUtils.randomPort();
  }

  return port(value);
};


module.exports.domainIp = (value) => {
  // The fake SIP stack is goint to use the target if not provided
  if (value === 'ip') { return null; }

  return domain(value);
};


module.exports.ips = ips;


module.exports.ports = (value) => {
  const finalValue = value.toString();

  if (finalValue.split(',').length > 1) {
    return portList(value);
  } else if (finalValue.split('-').length === 2) {
    return portRange(finalValue);
  }

  return [port(finalValue)];
};


module.exports.ipsDomain = (value) => {
  try {
    return domain(value);
  } catch (e) {
    return ips(value);
  }
};


// Needed by the "autoVoip" module
module.exports.isDomain = isDomain;
