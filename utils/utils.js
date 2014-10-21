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

var lodash = require('lodash'),

    // Statics
    SIP_REQS = [
            'REGISTER', 'INVITE', 'OPTIONS', 'MESSAGE', 'BYE', 'CANCEL', 'ACK',
            'Trying', 'Ringing', 'OK', 'SUBSCRIBE' , 'NOTIFY', 'PUBLISH', 'random'
        ],
    // http://www.openssl.org/docs/ssl/ssl.html#DEALING_WITH_PROTOCOL_METHODS
    TLS_TYPES = [ 'TLSv1', 'SSLv2', 'SSLv3' ];


// Public functions

module.exports.randomString = function (length, base) {
    var id = '';

    if (length === null) {
        length = 8;
    }
    if (base === null) {
        base = 36;
    }

    while (id.length < length) {
        id += Math.random().toString(base).substr(2);
    }

    return id.substr(0, length);
};

module.exports.randomIP = function () {
    var array = [];

    for (var i = 0; i <= 3; i++) {
        array.push(lodash.random(1, 255));
    }

    return array.join('.');
};

module.exports.randomIP6 = function () {
    var array = [];

    for (var i = 0; i <= 7; i++) {
        array.push(this.randomString(4, 16));
    }

    return array.join(':');
};

module.exports.randomPort = function () {
    return lodash.random(1025, 65535);
};

module.exports.randomPort2 = function() {
    return lodash.random(6000, 65535);
};

module.exports.randSipReq = function () {
    return SIP_REQS[lodash.random(11)];
};

module.exports.getSipReqs = function () {
    return SIP_REQS;
};

module.exports.getTlsTypes = function () {
    return TLS_TYPES;
};

module.exports.getCombinations = function (chars) {
    var result = [],
        f      = function (prefix, chars) {
            for (var i = 0; i < chars.length; i++) {
                result.push(prefix + chars[i]);
                f(prefix + chars[i], chars.slice(i + 1));
            }
        };

    f('', chars);

    return result;
};

module.exports.createAutoTargets = function (ips, customServices, sipTypes) {
    var targets = [];

    // Getting all combinations
    lodash.each(ips, function (target) {
        lodash.each(customServices, function (sipService) {
            // All requeqs which the server could answer at
            lodash.each(sipTypes, function (meth) {
                if (sipService.transport === 'TLS') {
                    lodash.each(TLS_TYPES, function (tlsVersion) {
                        targets.push({
                            ip        : target,
                            port      : sipService.port,
                            transport : sipService.transport,
                            meth      : meth,
                            tlsType   : tlsVersion
                        });
                    });
                } else if (sipService.transport === 'WS' ||
                           sipService.transport === 'WSS') {
                    lodash.each(['', 'ws'], function (wsPath) {
                        targets.push({
                            ip        : target,
                            port      : sipService.port,
                            transport : sipService.transport,
                            meth      : meth,
                            wsPath    : wsPath
                        });
                    });
                } else {
                    targets.push({
                        ip        : target,
                        port      : sipService.port,
                        transport : sipService.transport,
                        meth      : meth,
                    });
                }
            });
        });
    });

    return targets;
};

module.exports.isReservedIp = function (address) {
    return /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)/.test(address);
};

module.exports.customHttpAgent = function () {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0)' +
           'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' +
           '31.0.1650.63 Safari/537.36';
};
