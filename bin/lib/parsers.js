/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

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
const utils = require('.');
const networkUtils = require('./network');
const errMsgs = require('../cfg/errorMsgs').types;
const transports = require('../cfg/parsers');

const dbg = utils.dbg(__filename);


function ip(value) {
  if (net.isIP(value)) { return value; }

  // We return instead throw for convenience.
  throw new Error(errMsgs.ip);
}

module.exports.ip = ip;


function port(value) {
  // Passed as numbers and "validator"" always needs strings.
  if (utils.validator.isPort(value.toString())) { return value; }

  throw new Error(errMsgs.port);
}

module.exports.port = port;


module.exports.natural = (value) => {
  if (utils.validator.isInt(value.toString(), { gt: -1 })) { return value; }

  throw new Error(errMsgs.natural);
};


module.exports.bool = (value) => {
  // Passed as booleans and "validator"" always needs strings.
  if (utils.validator.isBoolean(value.toString())) { return value; }

  throw new Error(errMsgs.bool);
};


module.exports.url = (value) => {
  if (utils.validator.isURL(value)) { return value; }

  throw new Error(errMsgs.url);
};


module.exports.domain = (value) => {
  if (utils.validator.isFQDN(value)) { return value; }

  throw new Error(errMsgs.domain);
};


function padNumber(number, padding) {
  return new Array(Math.max(padding - String(number).length + 1, 0)).join(0) + number;
}

module.exports.enumeration = (value) => {
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

    // TODO: Return an iterator instead to avoid huge memory fingerprints.
    const data = fs.readFileSync(path.resolve(__dirname, '..', slicedValue));
    if (!data) {
      throw new Error(`${errMsgs.readFile} : "${slicedValue}"`);
    }

    finalValues = data.toString().split('\n');
  } else {
    finalValues = [value];
  }

  return finalValues;
};


function transport(proto, value) {
  const protocols = transports[proto];
  const trimmed = value.toLowerCase();

  if (utils.includes(protocols, trimmed) !== -1) { return trimmed; }

  throw new Error(protocols.toString());
}


module.exports.httpTransport = value => transport('http', value);


module.exports.sipTransport = value => transport('sip', value);


module.exports.sipRequest = (value) => {
  const reqTypes = sipUtils.getSipReqs();
  const trimmed = value.toLowerCase();

  if (utils.includes(reqTypes, trimmed) !== -1) { return trimmed; }

  throw new Error(reqTypes.toString());
};


module.exports.lport = (value) => {
  if (value === 'real') {
    return null;
  } else if (value === 'random') {
    return networkUtils.randomPort();
  }

  return port(value);
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
    // TODO: Check this ESLint rule:
    // http://eslint.org/docs/rules/prefer-numeric-literals
    min = parseInt('0000', 16); // eslint-disable-line prefer-numeric-literals
    max = parseInt('ffff', 16); // eslint-disable-line prefer-numeric-literals
  }

  const finalValue = parseInt(value, raddix);

  if ((min <= finalValue) && (finalValue <= max)) { return true; }

  return false;
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

    const data = fs.readFileSync(path.resolve(__dirname, '..', slicedValue));
    if (!data) {
      throw new Error(`${errMsgs.readFile} : "${slicedValue}"`);
    }

    return data.toString().split('\n');
  } else if (value.split('/').length === 2) {
    return ipsCidr(value);
  } else if (value.split('-').length === 2) {
    return ipsRange(value);
  }

  return [ip(value)];
};


function portRange(value) {
  const splitValue = value.split('-');
  const finalPorts = [];

  if (utils.validator.isPort(splitValue[0]) && utils.validator.isPort(splitValue[1])) {
    for (let i = parseInt(splitValue[0], 10); i <= parseInt(splitValue[1], 10); i += 1) {
      finalPorts.push(parseInt(i, 10));
    }

    return finalPorts;
  }

  throw new Error(errMsgs.portRange);
}

function portList(value) {
  let finalPorts = [];
  let split = value.split(',');

  split = utils.map(split, p => p.trim());
  dbg('"portList" reached', { split });

  utils.each(split, (singlePort) => {
    dbg('Port', { singlePort });
    if (singlePort.split('-').length === 2) {
      dbg('A range');
      finalPorts = finalPorts.concat(portRange(singlePort));
    } else {
      dbg('Single');
      finalPorts.push(port(singlePort));
    }
  });

  dbg('Final:', { finalPorts });
  return finalPorts;
}

module.exports.ports = (value) => {
  const finalValue = value.toString();

  if (finalValue.split(',').length > 1) {
    return portList(value);
  } else if (finalValue.split('-').length === 2) {
    return portRange(finalValue);
  }

  return [port(finalValue)];
};


// TODO: Move to the client
// Get the IP address from a network interface value
// Returns a promise (depending of the value) to get
// an IP address.
// TODO: Promises still not supported.
// module.exports.srcHost = utils.Promise.method(value => {
//   console
//   dbg(`Entering "srcHost", parsing value "${value}"`);
//
//   if (value.slice(0, 6) === 'iface:') {
//     dbg('Getting the IP from an iface ...');
//     const ipAdd = value.slice(0, 6);
//
//     // "localIp" is already a promise.
//     return localIp(ipAdd);
//   } else if (value === 'external') {
//     dbg('Getting the external IP ...');
//
//     // "request" is also a promise but we need to change the result,
//     return new Promise(rsl => {
//       request('http://icanhazip.com/')
//       .then(body => {
//         dbg(`Request finished, body: ${body}`);
//         // Removing the ending '\n'
//         const parsed = body.substr(0, body.length - 1);
//         dbg(`Parsed response: ${parsed}`);
//         rsl(parsed);
//       });
//     });
//   } else if (value === 'random') {
//     // This was the stack is going to random it.
//     // TODO: Change this crap when we use another stack.
//     dbg('random');
//
//     return null;
//   }
//
//   dbg('Common ip check');
//   // General case: a single IP.
//   // We need to return a promise also here.
//   return utils.Promise.method(ip(value));
//   // return ip(value);
// });
