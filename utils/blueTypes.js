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

var net        = require('net'),
    Netmask = require('netmask').Netmask,
    lodash  = require('lodash'),
    fs      = require('fs'),

    utils   = require('./utils');


// Helpers

function isPositiveInt (value) {
    if ((parseFloat(value) === parseInt(value)) && !isNaN(value)) {
        return true;
    } else {
        return false;
    }
}

function isPort (value) {
    return ( isPositiveInt(value) && (0 <= parseInt(value)) && (parseInt(value) <= 65535) );
}

function isIpBlock (value, version) {
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

function isCidrMask (value, version) {
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


// Private functions

function positiveInt (value) {
    if (isPositiveInt(value)) {
        return (parseInt(value));
    } else {
        throw new Error('Any positive integer');
    }
}

function port (value) {
    if (isPort(value)) {
        return parseInt(value);
    } else {
        throw new Error('Any valid port (0..65535)');
    }
}

function portRange (value) {
    var splitValue = value.split('-'),
        finalPorts = [];

    if (isPort(splitValue[0]) && isPort(splitValue[1])) {
        for (var i = parseInt(splitValue[0]); i <= parseInt(splitValue[1]); i++) {
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

function targetIp (value) {
    if (net.isIP(value)) {
        return value;
    } else {
        throw new Error('All valid IPv4/IPv6 single adderess are allowed');
    }
}

function targetRange (value) {
    var splitValue = value.split('-'),
        finalIps   = [],
        blockBase  = '',
        radix, separator, blockMin, blockMax, splitted0;

    // TODO: Not supported in ranges for now
    if (net.isIPv6(splitValue[0])) {
        throw new Error('IPv6 still not supported for ranges');
    } else {
        if ( (net.isIPv4(splitValue[0]) && isIpBlock(splitValue[1], 4)) ||
            (net.isIPv6(splitValue[0]) && isIpBlock(splitValue[1], 6)) ) {
            if (net.isIPv4(splitValue[0])) {
                separator = '.';
                radix      = 10;
            } else {
                separator = ':';
                radix      = 16;
            }

            splitted0 = splitValue[0].split(separator);
            for (var i = 0; i < (splitted0.length-1); i++) {
                blockBase += splitted0[i].toString() + separator;
            }
            blockMin = parseInt(splitted0[splitted0.length-1], radix);
            blockMax = parseInt(splitValue[1], radix);

            for (i = blockMin; i <= blockMax; i++) {
                finalIps.push(blockBase + parseInt(i.toString(radix)));
            }

            return finalIps;
        } else {
            throw new Error('ie: 192.168.0.1-5 (only last block supported for now)');
        }
    }
}

function targetCidr (value) {
    var splitValue = value.split('/'),
        finalIps   = [],
        block;

    if ((net.isIPv4(splitValue[0]) && isCidrMask(splitValue[1], 4)) ||
        (net.isIPv6(splitValue[0]) && isCidrMask(splitValue[1], 6))) {
        block = new Netmask(value);
        if (net.isIPv4(splitValue[0])) {
            block.forEach(function (ip, long, index) {
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

function userPassInfo () {
    return 'Any value is valid as user and pass, so we need some way\n' +
           'to the user to specify if it\'s a numerical range or a file\n' +
           'ie:\n' +
           'range:0100-1500 (note: padding matters here!)\n' +
           'file:../artifacts/john.txt';
}

function padNumber(number, padding) {
    return new Array(Math.max(padding - String(number).length + 1, 0)).join(0) + number;
}

function userPass (value) {
    var finalValues = [],
        slicedValue, data, splitted, padding, init, last;

    if (value.slice(0,6) === 'range:') {
        slicedValue = value.slice(6);
        splitted = slicedValue.split('-');
        padding = splitted[0].length;
        init = parseInt(splitted[0]);
        last = parseInt(splitted[1]);
        for (var i=init; i<=last; i++) {
            finalValues.push(padNumber(i, padding));
        }
    } else if (value.slice(0,5) === 'file:') {
        slicedValue = value.slice(5);

        data = fs.readFileSync(slicedValue);
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

function domain (value) {
    var splitDomain = value.split('.');

    if ((splitDomain.length === 2) ||
        ((splitDomain.length === 3) && (splitDomain[0] === 'www'))) {
        return value;
    } else {
        throw new Error('ie: google.com, www.google.com');
    }
}


// Public functions
// - They return the option in the final type needed by the module
// - Should throw an error if not passing the check
// - The error could include hints about a correct input

module.exports.yesNo = function (value) {
    if (value === 'yes' || value === 'no') {
        if (value === 'yes') {
            return true;
        } else {
            return false;
        }
    } else {
        throw new Error('valid: yes, no');
    }
};

module.exports.targets = function (value) {
    if (value.slice(0,5) === 'file:') {
        var slicedValue = value.slice(5),
            data;

        data = fs.readFileSync(slicedValue);
        if (!data) {
            throw new Error('Reading file: "' + slicedValue + '"');
        } else {
            return data.toString().split('\n');
        }
    } else if (value.split('/').length === 2) {
        return targetCidr(value);
    } else if (value.split('-').length === 2) {
        return targetRange(value);
    } else {
        return [targetIp(value)];
    }
};

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

// Any value is valid as user and pass, so we need some way
// to the user to specify if it's a numerical range or a file
// ie:
// range:0100-1500 (note: padding imports here!)
// file:../artifacts/john.txt
module.exports.userPass = function (value) {
    return userPass(value);
};

module.exports.anyValue = function (value) {
    return value;
};

module.exports.protocols = function (value) {
    var protocols  = ['UDP', 'TCP', 'TLS', 'WS', 'WSS'],
        finalValue = value.toUpperCase();


    if (protocols.indexOf(finalValue) !== -1) {
        return finalValue;
    } else {
        throw new Error(protocols.toString());
    }
};

module.exports.sipRequests = function (value) {
    var types = utils.getSipReqs();

    if (types.indexOf(value) !== -1) {
        return value;
    } else {
        throw new Error(types.toString());
    }
};

//// Evilscan options
//module.exports.statusEvil = function (value) {
//    // [T]imeout, [R]efused, [O]pen, [U]nreachable
//    var statuses = utils.getCombinations(['T', 'R', 'O', 'U']);
//
//    if (statuses.indexOf(value) !== -1) {
//        return value;
//    } else {
//        throw new Error(statuses.toString());
//    }
//};
//
//module.exports.targetsEvil = function (value) {
//    if (value.split('/').length === 2 ||
//        value.split('-').length === 2 || net.isIPv4(value)) {
//        return value;
//    } else {
//        throw new Error('Evilscan only supports this formats: cidr|ipv4|host');
//    }
//};

module.exports.tlsType = function (value) {
    // http://www.openssl.org/docs/ssl/ssl.html#DEALING_WITH_PROTOCOL_METHODS
    var types = utils.getTlsTypes();

    if (types.indexOf(value) !== -1) {
        return value;
    } else {
        throw new Error(types.toString());
    }
};

module.exports.delay = function (value) {
    if (value === 'async' || positiveInt(value) || value === 0) {
        return value;
    } else {
        throw new Error('"async" or a positive int');
    }
};

module.exports.targetIpRand = function (value) {
    if (value === 'random') {
        return null;
    } else {
        return targetIp(value);
    }
};

module.exports.portRand = function (value) {
    if (value === 'random') {
        return null;
    } else {
        return port(value);
    }
};

module.exports.nmapTargets = function (value) {
    var split0  = value.split('/'),
        split1  = value.split('-');

    if (split0.length === 2 && net.isIP(split0[0]) && isCidrMask(split0[1])) {
        return value;
    } else if (split1.length === 2 && isIpBlock(split1[1])) {
        return value;
    } else if (net.isIP(value)) {
        return value;
    } else {
        throw new Error('Single hostname/ipv4 (ipv6 is not yet implemented), a CIDR or a numerical range');
    }
};

module.exports.nmapPorts = function (value) {
    var split0    = value.split(','),
        split1    = value.split('-'),
        allFine   = false,
        errString = 'ie: "21,22,80,443,3306,60000-65535"';

    if (split0.length > 1) {
        return value;
    } else if (split1.length === 2) {
        return value;
    } else if (isPort(value)) {
        return value;
    } else {
        throw new Error(errString);
    }
};

module.exports.domainIp = function (value) {
    if (value === 'ip') {
        return null;
    } else {
        return domain(value);
    }
};

// Aliases
module.exports.domain      = domain;
module.exports.targetIp       = targetIp;
module.exports.port           = port;
module.exports.positiveInt = positiveInt;
