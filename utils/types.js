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

var net = require('net'),
    fs = require('fs'),
    path = require('path'),
    Netmask = require('netmask').Netmask,
    lodash = require('lodash'),
    sipUtils = require('sip-fake-stack').utils,
    networkUtils = require('./network'),

    TRANSPORTS = ['UDP', 'TCP', 'TLS', 'WS', 'WSS'];


// Helpers

function isPositiveInt(value) {
    return (value === 0 || (value || 0) > 0 && value % 1 === 0);
}

function isDomain(value) {
    var reDomain = /^([a-zA-Z0-9\-]{0,63}\.)+[a-zA-Z0-9]{2,}$/;

    return reDomain.test(value.toString());
}

function isPort(value) {
    return (isPositiveInt(value) && (0 <= parseInt(value)) && (parseInt(value) <= 65535));
}

function isIpBlock(value, version) {
    var raddix, min, max, finalValue;

    if (version === 4) {
        raddix = 10;
        min = 0;
        max = 255;
    } else {
        raddix = 16;
        min = parseInt('0000', 16);
        max = parseInt('ffff', 16);
    }

    finalValue = parseInt(value, raddix);

    if ((min <= finalValue) && (finalValue <= max)) {
        return true;
    } else {
        return false;
    }
}

function isCidrMask(value, version) {
    var finalValue = parseInt(value, 10),
        min, max;

    if (version === 4) {
        min = 0;
        max = 32;
    } else {
        min = 8;
        max = 128;
    }

    if ((min <= finalValue) && (finalValue <= max)) {
        return true;
    } else {
        return false;
    }
}

function ip(value) {
    if (net.isIP(value)) {
        return value;
    } else {
        throw new Error('Any valid IPv4/IPv6 single address');
    }
}

function port(value) {
    if (isPort(value)) {
        return parseInt(value);
    } else {
        throw new Error('Any valid port (0..65535)');
    }
}

function domain(value) {
    if (isDomain(value)) {
        return value;
    } else {
        throw new Error('ie: google.com, www.google.com');
    }
}

function padNumber(number, padding) {
    return new Array(Math.max(padding - String(number).length + 1, 0)).join(0) + number;
}

function userPass(value) {
    var finalValues = [],
        slicedValue, data, splitted, padding, init, last, i;

    if (value.slice(0, 6) === 'range:') {
        slicedValue = value.slice(6);
        splitted = slicedValue.split('-');
        padding = splitted[0].length;
        init = parseInt(splitted[0]);
        last = parseInt(splitted[1]);
        for (i = init; i <= last; i += 1) {
            finalValues.push(padNumber(i, padding));
        }
    } else if (value.slice(0, 5) === 'file:') {
        slicedValue = value.slice(5);

        data = fs.readFileSync(path.resolve(__dirname, '../', slicedValue));
        if (!data) {
            throw new Error('Reading file: "' + slicedValue + '"');
        } else {
            return data.toString().split('\n');
        }
    } else {
        finalValues = [value];
    }
    return finalValues;
}

function ipsRange (value) {
    var splitValue = value.split('-'),
        finalIps   = [],
        blockBase  = '',
        radix, separator, blockMin, blockMax, splitted0;

    // TODO: Not supported in ranges for now
    if (net.isIPv6(splitValue[0])) {
        throw new Error('IPv6 still not supported for ranges');
    }
    if ((net.isIPv4(splitValue[0]) && isIpBlock(splitValue[1], 4)) ||
        (net.isIPv6(splitValue[0]) && isIpBlock(splitValue[1], 6)) ) {
        if (net.isIPv4(splitValue[0])) {
            separator = '.';
            radix = 10;
        } else {
            separator = ':';
            radix = 16;
        }

        splitted0 = splitValue[0].split(separator);
        for (var i = 0; i < (splitted0.length-1); i += 1) {
            blockBase += splitted0[i].toString() + separator;
        }
        blockMin = parseInt(splitted0[splitted0.length-1], radix);
        blockMax = parseInt(splitValue[1], radix);

        for (i = blockMin; i <= blockMax; i += 1) {
            finalIps.push(blockBase + parseInt(i.toString(radix)));
        }

        return finalIps;
    } else {
        throw new Error('ie: 192.168.0.1-5 (only last block supported for now)');
    }
}

function ipsCidr (value) {
    var splitValue = value.split('/'),
        finalIps   = [],
        block;

    if ((net.isIPv4(splitValue[0]) && isCidrMask(splitValue[1], 4)) ||
        (net.isIPv6(splitValue[0]) && isCidrMask(splitValue[1], 6))) {
        block = new Netmask(value);
        if (net.isIPv4(splitValue[0])) {
            block.forEach(function (ip) {
                finalIps.push(ip);
            });
        } else {
            throw new Error('IPv6 still not supported for CIDR');
        }

        return finalIps;
    } else {
        throw new Error('ie: 192.168.0.0/24, 2001:0C00::/32');
    }
}

function ips(value) {
    if (value.slice(0,5) === 'file:') {
        var slicedValue = value.slice(5),
            data;

        data = fs.readFileSync(path.resolve(__dirname, '../', slicedValue));
        if (!data) {
            throw new Error('Reading file: "' + slicedValue + '"');
        } else {
            return data.toString().split('\n');
        }
    } else if (value.split('/').length === 2) {
        return ipsCidr(value);
    } else if (value.split('-').length === 2) {
        return ipsRange(value);
    } else {
        return [ip(value)];
    }
}

function portRange (value) {
    var splitValue = value.split('-'),
        finalPorts = [];

    if (isPort(splitValue[0]) && isPort(splitValue[1])) {
        for (var i = parseInt(splitValue[0]); i <= parseInt(splitValue[1]); i += 1) {
            finalPorts.push(parseInt(i));
        }
        return finalPorts;
    } else {
        throw new Error('ie: 5060-5065');
    }
}

function portList (value) {
    var splitedPorts = value.split(','),
        finalPorts = [];

    lodash.each(splitedPorts, function (singlePort) {
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

module.exports.positiveInt = function (value) {
    if (isPositiveInt(value)) {
        return parseInt(value);
    } else {
        throw new Error('Any positive integer');
    }
};

module.exports.domain = domain;

module.exports.port = port;

module.exports.ip = ip;

module.exports.networkProtocol = function (value) {
    var protocols = TRANSPORTS,
        finalValue = value.toUpperCase();

    if (protocols.indexOf(finalValue) !== -1) {
        return finalValue;
    } else {
        throw new Error(protocols.toString());
    }
};

// To use with https://github.com/jas-/node-libnmap
module.exports.nmapTargets = function (value) {
    var split0 = value.split('/'),
        split1 = value.split('-');

    if ((split0.length === 2 && net.isIP(split0[0])) && isCidrMask(split0[1]) ||
       (split1.length === 2 && isIpBlock(split1[1])) || net.isIP(value)) {
        return value;
    } else {
        throw new Error('Single hostname ipv4 (still not ipv6), a CIDR or a' +
                        'numerical range (ie: 192.168.0.0/24, 192.168.1.1-5');
    }
};

module.exports.nmapPorts = function (value) {
    var split0 = value.split(','),
        split1 = value.split('-');

    if (split0.length > 1) {
        return value;
    } else if (split1.length === 2) {
        return value;
    } else if (isPort(value)) {
        return value;
    } else {
        throw new Error('ie: 21,22,80,443,3306,60000-65535');
    }
};

// To avoid problems using falsy values
module.exports.allValid = function (value) {
    return value;
};

module.exports.yesNo = function (value) {
    if (value === 'yes' || value === 'no') {
        if (value === 'yes') {
            return true;
        } else {
            return false;
        }
    } else {
        throw new Error('valid: yes | no');
    }
};

module.exports.userPass = userPass;

module.exports.transports = function (value) {
    var protocols = TRANSPORTS,
        finalValue = value.toUpperCase();

    if (protocols.indexOf(finalValue) !== -1) {
        return finalValue;
    } else {
        throw new Error(protocols.toString());
    }
};

module.exports.sipRequests = function (value) {
    var types = sipUtils.getSipReqs();

    if (types.indexOf(value) !== -1) {
        return value;
    } else {
        throw new Error(types.toString());
    }
};

// Get the IP address from a network interface value
module.exports.srcHost = function (value) {
    // the "parseOptions" (in "common.js" file) method will
    // get the final value
    if (value.slice(0, 6) === 'iface:') {
        return value;
    } else if (['random', 'external'].indexOf(value) !== -1) {
        return value;
    } else {
        return ip(value);
    }
};

module.exports.srcPort = function (value) {
    if (value === 'real') {
        return null;
    } else if (value === 'random') {
        return networkUtils.randomPort();
    } else {
        return port(value);
    }
};

module.exports.domainIp = function (value) {
    if (value === 'ip') {
		// The fake SIP stack is goint to use the target if not provided
        return null;
    } else {
        return domain(value);
    }
};

module.exports.ips = ips;

module.exports.ports = function (value) {
    var finalValue = value.toString();

    if (finalValue.split(',').length > 1) {
        return portList(value);
    } else if (finalValue.split('-').length === 2) {
        return portRange(finalValue);
    } else {
        return [port(finalValue)];
    }
};

module.exports.ipsDomain = function (value) {
    try {
        return domain(value);
    } catch (e) {
        return ips(value);
    }
};

// Needed by the "autoVoip" module
module.exports.isDomain = isDomain;