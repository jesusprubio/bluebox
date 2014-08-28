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
    GRAMMAR = {
        versionRE   : /(\d{1,2}(\.\d{1,2})?(\.\d{1,2}})?)/,
        portRE      : /\d{2,5}/,
        portRangeRE : /(\d{1,5})-(\d{1,5})/,
        extRE       : /\d{1,10}/,
        extRangeRE  : /\d{1,10}-\d{1,10}/,
        userRE      : /User\-Agent\:/i,
        serverRE    : /Server\:/i,
        orgRE       : /Organization\:/i,
        codeLineRE  : /SIP\/2.0\ /,
        codeRE      : /\d{3}/,
        fileRE      : /\.txt/,
        authRE      : /WWW-Authenticate\:/i,
        authProxyRE : /Proxy-Authenticate\:/i,
        realmRE     : /realm/i,
        nonceRE     : /nonce/i,
        httpRE      : /http:\/\//
    };


// Private functions

function splitMsg (msg) {
    return msg.toString().split('\r\n');
}


// Public functions

// It parses "User-Agent" string from a packet.
module.exports.userAgent = function (pkt) {
    var userLine = lodash.filter(splitMsg(pkt), function (line) {
        return GRAMMAR.userRE.test(line);
    });

    return (userLine[0]).split(':')[1];
};

module.exports.code = function (pkt) {
    var codeLine = lodash.filter(splitMsg(pkt), function (line) {
        return GRAMMAR.codeLineRE.test(line);
    });
        
    return (codeLine[0]).match(GRAMMAR.codeRE)[0];
};

// It parses "Server" string from a packet.
module.exports.server = function (pkt) {
    var serverLine = lodash.filter(splitMsg(pkt), function (line) {
        return GRAMMAR.serverRE.test(line);
    });
    
    return (serverLine[0]).split(':')[1];
};

// It parses "Organization" string from a packet.
module.exports.organization = function (pkt) {
    var orgLine = lodash.filter(splitMsg(pkt), function (line) {
        return GRAMMAR.orgRE.test(line);
    });
    
    return (orgLine[0]).split(':')[1];
};

// It parses the service from a string.
module.exports.service = function (fprint) {
    var cutString, match, service;
    
    // TODO: Refactor this
    match = /fpbx/i.test(fprint.toString());
    if (match) {
        service = 'FreePBX';
    } else {
        cutString = fprint.split(' ');
        if (cutString[2]) {
            service = cutString[1];
        } else {
            cutString = fprint.split('-');
            if (cutString[1]) {
                service = cutString[0];
            } else {
                cutString = fprint.split('/');
                if (cutString[1]) {
                    service = cutString[0];
                } else {
                    service = fprint;
                }
            }
        }
    }
    
    return service;
};

// It parses the service version from a string.
module.exports.version = function (fprint) {
    var version;
    
    return (fprint.match(GRAMMAR.versionRE))[0];
};

module.exports.realmNonce = function (pkt) {
    var isProxy     = false,
        splittedMsg = splitMsg(pkt),
        authLine, authSplit, nonce, realm;
    
    authLine = lodash.filter(splittedMsg, function (line) {
        return (GRAMMAR.authRE.test(line) || GRAMMAR.authProxyRE.test(line));
    })[0]; // It should appears only once
        
    if (GRAMMAR.authProxyRE.test(authLine)) {
        isProxy = true;
    }
    if (!authLine) {
        return null;
    } else {
        // Deleting "Proxy-Authenticate" or "WWW-Authenticate" from the string.
        if (isProxy) {
            authLine = authLine.slice(20);
        } else {
            authLine = authLine.slice(18);
        }
        authSplit = authLine.split(',');
                        
        for (var i = 0; i < authSplit.length; i++) {
            if (GRAMMAR.realmRE.test(authSplit[i])) {
                realm = (authSplit[i].split('='))[1].slice(1, -1);
            }
            if (GRAMMAR.nonceRE.test(authSplit[i])) {
                nonce = (authSplit[i].split('='))[1].slice(1, -1);
            }
        }
        
        return {
            realm   : realm,
            nonce   : nonce,
            isProxy : isProxy
        };
    }
};