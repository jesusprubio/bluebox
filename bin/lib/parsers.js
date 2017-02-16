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


const fs = require('fs');
const net = require('net');
const path = require('path');

const LineByLine = require('n-readlines');
const Netmask = require('netmask').Netmask;
const sipUtils = require('sip-fake-stack').utils;
const utils = require('.');
const networkUtils = require('./network');
const errMsgs = require('../cfg/errorMsgs').types;
const transports = require('../cfg/parsers');

const dbg = utils.dbg(__filename);


const dicNames = fs.readdirSync(path.resolve(__dirname, '..', 'artifacts', 'dics'));
module.exports.dics = utils.map(dicNames, dicName => path.basename(dicName, '.txt'));


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
  // Could come as a boolean or as a string.
  const finalValue = value.toString();
  if (utils.validator.isBoolean(finalValue)) { return utils.validator.toBoolean(finalValue); }

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

// We can't use arrays to avoid a huge memory fingerprints in case of huge ones.
// So we use custom iterators:
// https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Iterators_and_Generators
function iterRanges(min, max, padding) {
  let index = min;

  return {
    reset: () => { index = min; },
    next: () => {
      if (index <= max) {
        let value = index;
        if (padding) {
          value = padNumber(index, padding);
        }
        index += 1;

        return {
          value,
          done: false,
        };
      }
      return { done: true };
    },
  };
}


function iterSingle(value) {
  let index = 0;

  return {
    reset: () => { index = 0; },
    next: () => {
      if (index === 0) {
        index += 1;

        return {
          value,
          done: false,
        };
      }

      return { done: true };
    },
  };
}

function iterFile(filePath) {
  let liner = new LineByLine(filePath);

  return {
    // The "reset" method included in the library is not valid for our case
    // because it doesn't work when the iterator has finished.
    reset: () => { liner = new LineByLine(filePath); },
    next: () => {
      const line = liner.next();
      if (line !== false) {
        return {
          value: line.toString(),
          done: false,
        };
      }

      return { done: true };
    },
  };
}


module.exports.enum = (value) => {
  dbg('Parsing started for enumeration', value);

  if (value.slice(0, 6) === 'range:') {
    dbg('Range detected');
    const slicedValue = value.slice(6);
    const splitted = slicedValue.split('-');
    const init = parseInt(splitted[0], 10);
    const last = parseInt(splitted[1], 10);
    const padding = splitted[0].length;

    return iterRanges(init, last, padding);
  } else if (value.slice(0, 5) === 'file:') {
    dbg('File detected');
    const passedName = value.slice(5);

    // The same here, we can't use arrays if the file is too huge (as expected).
    // If the user passes a relative path.
    let filePath = path.resolve(process.cwd(), passedName);

    // If the user passes a built-in dictionary name.
    if (utils.includes(dicNames, `${passedName}.txt`)) {
      filePath = path.resolve(__dirname, '..', 'artifacts', 'dics', `${passedName}.txt`);
    }

    return iterFile(path.resolve(process.cwd(), filePath));
  }

  dbg('Single value detected');
  // Also an iterator to keep the consistency.
  return iterSingle(value);
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

  if (value === 'random') { return utils.sample(reqTypes); }
  if (utils.includes(reqTypes, trimmed)) { return trimmed; }

  throw new Error(reqTypes.toString());
};


module.exports.ipRandom = (value) => {
  if (value === 'random') { return networkUtils.randomIp(); }

  return ip(value);
};


module.exports.lport = (value) => {
  if (value === 'real') { return null; }

  if (value === 'random') { return networkUtils.randomPort(); }

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


function iterMulti(array) {
  let nextIndex = 0;

  return {
    reset: () => { nextIndex = 0; },
    next: () => {
      if (nextIndex < array.length) {
        const value = array[nextIndex];
        nextIndex += 1;
        return {
          value,
          done: false,
        };
      }

      return { done: true };
    },
  };
}


function iterIpCidr(value) {
  const splitValue = value.split('/');

  // TODO: Review and implement all we need to have fuff IPv6 support.
  if (net.isIPv6(splitValue[0])) {
    throw new Error(errMsgs.notV6);
  }

  if (!net.isIPv4(splitValue[0]) ||
  (net.isIPv4(splitValue[0]) && !isCidrMask(splitValue[1], 4))) {
    throw new Error(errMsgs.ipsCidr);
  }

  // TODO: Possible big memory fingerprint.
  // User library: https://github.com/rs/node-netmask
  // Implement a pure iterator or use any library which makes it for us.
  // It should suppose a problem this fake iterator because the list should fit in memory.
  const block = new Netmask(value);
  const finalIps = [];
  block.forEach(ipAdd => finalIps.push(ipAdd));

  return iterMulti(finalIps);
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
    min = parseInt('0000', 16); // eslint-disable-line prefer-numeric-literals
    max = parseInt('ffff', 16); // eslint-disable-line prefer-numeric-literals
  }

  const finalValue = parseInt(value, raddix);

  if ((min <= finalValue) && (finalValue <= max)) { return true; }

  return false;
}


function iterIpRanges(value) {
  const splitValue = value.split('-');
  let blockBase = '';
  const separator = '.';
  const radix = 10;

  if (net.isIPv6(splitValue[0])) {
    throw new Error(errMsgs.notV6);
  }
  if (!net.isIPv4(splitValue[0]) ||
  (net.isIPv4(splitValue[0]) && !isIpBlock(splitValue[1], 4))) {
    throw new Error(errMsgs.ipsRange);
  }

  // if (net.isIPv4(splitValue[0])) {
  //   separator = '.';
  //   radix = 10;
  // } else {
  //   separator = ':';
  //   radix = 16;
  // }

  const splitted0 = splitValue[0].split(separator);

  for (let i = 0; i < (splitted0.length - 1); i += 1) {
    blockBase += splitted0[i].toString() + separator;
  }
  const blockMin = parseInt(splitted0[splitted0.length - 1], radix);
  const blockMax = parseInt(splitValue[1], radix);
  let nextIndex = blockMin;

  return {
    reset: () => { nextIndex = blockMin; },
    next: () => {
      if (nextIndex <= blockMax) {
        const valueF = `${blockBase}${nextIndex}`;
        nextIndex += 1;
        return {
          value: valueF,
          done: false,
        };
      }
      return { done: true };
    },
  };
}


module.exports.ips = (value) => {
  dbg('IPs parsing started', value);

  if (value.slice(0, 5) === 'file:') {
    const sliced = value.slice(5);
    dbg('IPs file detected');

    return iterFile(path.resolve(process.cwd(), sliced));
  } else if (value.split('/').length === 2) {
    dbg('"IPs CIDR" reached');

    return iterIpCidr(value);
  } else if (value.split('-').length === 2) {
    dbg('"IPs range" reached');

    return iterIpRanges(value);
  }

  dbg('"IPs single" reached');
  return iterSingle(value);
};


module.exports.ports = (value) => {
  const finalValue = value.toString();
  dbg('Ports reached', { finalValue });

  if (finalValue.split(',').length > 1) {
    let split = value.split(',');
    dbg('"ports list" reached', split);

    split = utils.map(split, p => p.trim());

    return iterMulti(split);
  }

  if (finalValue.split('-').length === 2) {
    const splitValue = value.split('-');
    dbg('"ports range" reached');

    if (utils.validator.isPort(splitValue[0]) && utils.validator.isPort(splitValue[1])) {
      return iterRanges(parseInt(splitValue[0], 10), parseInt(splitValue[1], 10));
    }

    throw new Error(errMsgs.portRange);
  }

  dbg('"port single" reached');
  return iterSingle(finalValue);
};
