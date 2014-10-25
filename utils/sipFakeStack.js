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

// These functions are used to define the structure of a valid SIP packet following
// RFC 3261 (http://www.ietf.org/rfc/rfc3261.txt) and its extensions.
// SIP requests creator. It creates "more or less" valid SIP requests ;).

'use strict';

var os             = require('os'),
    net            = require('net'),
    crypto         = require('crypto'),
    lodash         = require('lodash'),
    randomPort     = require('random-port'),

    utils          = require('./utils'),
    SteroidsSocket = require('./steroidsSocket'),
    sipParser      = require('../utils/sipParser');


// Helpers

function getDigest (cfg) {
    var ha1, ha2, response;

    ha1 = crypto.createHash('md5').update(cfg.fromExt + ':' + cfg.realm + ':' + cfg.pass).digest('hex');
    ha2 = crypto.createHash('md5').update(cfg.meth + ':' + cfg.authUri).digest('hex');
//    console.log(cfg);
//    console.log('HA1: ' + cfg.fromExt + ':' + cfg.realm + ':' + cfg.pass)
//    console.log('HA1MD5:'+ ha1);
//    console.log('HA2: ' + cfg.meth + ':' + cfg.authUri);
//    console.log('HA2MD5:'+ ha2);

    response =crypto.createHash('md5').update(
        ha1 + ':' + cfg.nonce + ':' + ha2).digest('hex');
//    console.log('response: ' + ha1 + ':' + cfg.nonce + ':' + ha2);
//    console.log('responseMD5: ' + response );
    return response;
}

function createMessage (options) {
    // We allow to rewrite all fields externally, we are in a security tool!
    var server       = options.server       || null,
        domain       = options.domain       || options.server,
        toExt        = options.toExt        || utils.randomString(3),
        fromExt      = options.fromExt      || utils.randomString(3),
        srcHost      = options.srcHost      || utils.randomIP(),
        srcPort      = options.lport        || utils.randomPort(),
        branchPad    = options.branchPad    || utils.randomString(30),
        cseq         = options.cseq         || 1,
        sessionId    = options.sessionId    || lodash.random(1000000000, 9999999999),
        sessionPort  = options.sessionPort  || lodash.random(1025, 65535),
        isProxy      = options.isProxy      || false,
        fromTag      = options.fromTag      || utils.randomString(10),
        toTag        = options.toTag        || utils.randomString(10),
        callId       = options.callId       || utils.randomString(16),
        tupleId      = options.tupleId      || utils.randomString(10),
        regId        = options.regId        || 1,
        gruuInstance = options.gruuInstance ||
            ('urn:uuid:' + (utils.randomString(3)) + '-' +
            (utils.randomString(4)) + '-' + (utils.randomString(8))),
        expires      = options.expires      || '3600',
        meth         = options.meth         || 'REGISTER',
        transport    = options.transport    || 'UDP',
        realm        = options.realm        || null,
        nonce        = options.nonce        || null,
        pass         = options.pass         || null,
        ipVersion    = '4',
        targetUri    = 'sip:' + domain,
        userAgent    = options.userAgent    || 'bluebox-scanner',
        maxForwards  = options.maxForwards  || '70',
        sipAccept    = options.sipAccept    || 'application/sdp',
        sipDate      = options.sipDate      || null,
        sipVersion   = options.sipVersion   || '2.0',
        badSeparator = options.badSeparator || false,
        badFields    = options.badFields    || false,

        contentType, contentLen, sipMessage, uriVia, uri, toUri, toUriVia,
        authUri, response, sdp, digestCfg;

    if (net.isIPv6(options.server)) {
        ipVersion = '6';
        server = '[' + server + ']';
        srcHost = options.srcHost || utils.randomIP6();
        srcHost = '[' + srcHost + ']';
        if (net.isIPv6(domain)) {
            domain = '[' + domain + ']';
        }
    }
    if (meth === 'REGISTER') { toExt = fromExt; }

    uriVia    = srcHost + ':' + srcPort;
    uri       = 'sip:' + fromExt + '@' + domain;
    toUri     = 'sip:' + toExt + '@' + domain;
//    toUriVia  = 'sip:' + toExt + '@' + domain;
    targetUri = 'sip:' + domain;

    // SIP frame is filled here
    if (!badFields) {
        switch (meth) {
            case 'REGISTER':
            case 'PUBLISH':
                sipMessage = meth + ' ' + targetUri + ' SIP/' + sipVersion + '\r\n';
                break;
            case 'OK':
                sipMessage = 'SIP/' + sipVersion + ' 200 OK\r\n';
                break;
            case 'Ringing':
                sipMessage = 'SIP/' + sipVersion + ' 180 Ringing\r\n';
            default:
                sipMessage = meth + ' ' + toUri + ' SIP/' + sipVersion + '\r\n';
        }
    } else {
        sipMessage = '';
    }
    // Via
    switch (transport) {
        case 'WS':
        case 'WSS':
            uriVia = '' + (utils.randomString(12)) + '.invalid';
    }
    sipMessage += 'Via: SIP/' + sipVersion + '/' + transport.toUpperCase() + ' ' + uriVia +
                ';branch=z9hG4bK' + branchPad;
    if (badSeparator) {
        sipMessage += ';;,;,,';
    }
    sipMessage += '\r\n';

    // From
    sipMessage += 'From: ' + fromExt + ' <' + uri + '>;tag=' + fromTag + '\r\n';
    // To
    switch (meth) {
        case 'REGISTER':
        case 'PUBLISH':
            sipMessage += 'To: <' + uri + '>\r\n';
            break;
        case 'INVITE':
        case 'OPTIONS':
        case 'MESSAGE':
        case 'CANCEL':
        case 'SUBSCRIBE':
        case 'NOTIFY':
            sipMessage += 'To: ' + toExt + ' <' + toUri + '>\r\n';
            break;
        default:
            sipMessage += 'To: ' + toExt + ' <' + toUri + '>;tag=' + toTag + '\r\n';
    }
    // Call-ID
    sipMessage += 'Call-ID: ' + callId + '@' + domain + '\r\n';
    // Cseq
    switch (meth) {
        case 'Trying':
        case 'Ringing':
        case 'OK':
            sipMessage += 'CSeq: ' + cseq + ' INVITE\r\n';
            break;
        default:
            sipMessage += 'CSeq: ' + cseq + ' ' + meth + '\r\n';
    }
    // Max-forwards
    sipMessage += 'Max-Forwards: ' + maxForwards + '\r\n';
    // Allow
    switch (meth) {
        case 'REGISTER':
        case 'INVITE':
        case 'MESSAGE':
        case 'SUBSCRIBE':
        case 'PUBLISH':
        case 'NOTIFY':
            sipMessage += 'Allow: REGISTER, INVITE, OPTIONS, ACK, CANCEL, BYE, MESSAGE, SUBSCRIBE, PUBLISH, NOTIFY\r\n';
    }
    // Supported
    switch (transport) {
        case 'WS':
        case 'WSS':
            sipMessage += 'Supported: path, outbound, gruu\r\n';
    }
    // User-Agent
    sipMessage += 'User-Agent: ' + userAgent;
    if (badSeparator) {
        sipMessage += ';;,;,,';
    }
    sipMessage += '\r\n';
    // Date
    if (sipDate) {
        sipMessage += 'Date: ' + sipDate + '\r\n';
    }

    // Presence
    switch (meth) {
        case 'SUBSCRIBE':
        case 'PUBLISH':
            sipMessage += 'Expires: 2600\r\n';
    }
    switch (meth) {
        case 'SUBSCRIBE':
        case 'PUBLISH':
        case 'NOTIFY':
            sipMessage += 'Event: presence\r\n';
    }
    // Contact
    if (transport === 'WS' || transport === 'WSS') {
        switch (meth) {
            case 'REGISTER':
            case 'OPTIONS':
            case 'PUBLISH':
            case 'SUBSCRIBE':
                sipMessage += 'Contact: <sip:' + fromExt + '@' + uriVia +
                    ';transport=ws;expires=' + expires + '>';
                sipMessage += ';reg-id=' + regId + ';sip.instance="<' +
                    gruuInstance + '>"\r\n';
                break;
            case 'INVITE':
            case 'MESSAGE':
            case 'OK':
            case 'Ringing':
            case 'NOTIFY':
            case 'CANCEL':
                sipMessage += 'Contact: <sip:' + fromExt + '@' + domain;
                sipMessage += ';gr=' + gruuInstance + ';ob>\r\n';
        }
    } else {
        switch (meth) {
            case 'REGISTER':
                sipMessage += 'Contact: <sip:' + fromExt + '@' + uriVia + '>;expires=' + expires + '\r\n';
                break;
            case 'OPTIONS':
            case 'PUBLISH':
            case 'SUBSCRIBE':
                sipMessage += 'Contact: <sip:' + fromExt + '@' + uriVia + '>\r\n';
                break;
            case 'INVITE':
            case 'MESSAGE':
            case 'OK':
            case 'Ringing':
            case 'NOTIFY':
            case 'CANCEL':
                if (transport === 'TLS') { transport = 'TCP'; }
                if (transport === 'WSS') { transport = 'WS'; }
                sipMessage += 'Contact: <sip:' + fromExt + '@' + uriVia +
                    ';transport=' + (transport.toLowerCase()) + '>\r\n';
        }
    }
    // Challenge
    if (realm && nonce && pass) {
        if (isProxy) {
            sipMessage += 'Proxy-Authorization:';
        } else {
            sipMessage += 'Authorization:';
        }
        switch (meth) {
            case 'REGISTER':
            case 'PUBLISH':
                authUri = targetUri;
            break;
            case 'INVITE':
            case 'OPTIONS':
            case 'MESSAGE':
            case 'OK':
            case 'Ringing':
            case 'NOTIFY':
            case 'CANCEL':
            case 'SUBSCRIBE':
                authUri = toUri;
        }
        digestCfg = {
            fromExt : fromExt,
            realm   : realm,
            pass    : pass,
            meth    : meth,
            authUri : authUri,
            nonce   : nonce
        };

        response = getDigest(digestCfg);
        sipMessage += ' Digest username="' + fromExt + '", realm="' + realm + '"';
        if (options.sqli) {
            sipMessage += 'UNION SELECT FROM subscriber WHERE username=' + fromExt +
                          ' and realm="' + domain + '"';
        }
        sipMessage += ',nonce="' + nonce + '", uri="' + authUri + '", response="' +
                        response + '", algorithm=MD5\r\n';
    }
    // Content-type and content
    switch (meth) {
        case 'INVITE':
        case 'OK':
            sdp = 'v=0\r\n';
            sdp += 'o=' + fromExt + ' ' + sessionId + ' ' + sessionId + ' IN IP' +
                ipVersion + ' ' + srcHost + '\r\n';
            sdp += 's=-\r\n';
            sdp += 'c=IN IP' + ipVersion + ' ' + srcHost + '\r\n';
            sdp += 't=0 0\r\n';
            sdp += 'm=audio ' + sessionPort + ' RTP/AVP 0\r\n';
            sdp += 'a=rtpmap:0 PCMU/8000\r\n';
            contentType = options.contentType || 'application/sdp';
            sipMessage += 'Content-Type: ' + contentType + '\r\n';

            contentLen = options.contentLen || sdp.length;
            sipMessage += 'Content-Length: ' + contentLen + '\r\n\r\n';
            sipMessage += sdp;
            break;
        case 'MESSAGE':
            sdp = 'OLA K ASE! ;)\r\n';
            contentType = options.contentType || 'text/plain';
            sipMessage += 'Content-Type: ' + contentType + '\r\n';
            contentLen = options.contentLen || sdp.length;
            sipMessage += 'Content-Length: ' + contentLen + '\r\n\r\n';
            sipMessage += sdp;
            break;
        case 'NOTIFY':
        case 'PUBLISH':
            sdp = '<presence xmlns="urn:ietf:params:xml:ns:pidf" ';
            sdp += 'entity="sip:' + toExt + '@' + domain + '">\r\n';
            sdp += '<tuple id="' + tupleId + '">\r\n';
            sdp += '<status>\r\n';
            sdp += '<basic>open</basic>\r\n';
            sdp += '</status>\r\n';
            sdp += '<contact priority="0.8">' + toExt + '@' + domain + '</contact>\r\n';
            sdp += '</tuple>\r\n';
            sdp += '</presence>\r\n';
            contentType = options.contentType || 'application/pidf+xml';
            sipMessage += 'Content-Type: ' + contentType + '\r\n';
            contentLen = options.contentLen || sdp.length;
            sipMessage += 'Content-Length: ' + contentLen + '\r\n\r\n';
            sipMessage += sdp;
            break;
        default:
            if (meth === 'OPTIONS') {
                sipMessage += 'Accept: ' + sipAccept + '\r\n';
            }
            contentLen = options.contentLen || '0';
            sipMessage += 'Content-Length: ' + contentLen + '\r\n\r\n';
    }

//    console.log(sipMessage);
    return sipMessage;
}


// Constructor

function SipFakeStack (config) {

    var self = this;

    if (!config.server) {
        throw '(SipFakeStack) You need at least to specify a valid IPv4/6 target';
    }

    this.server    = config.server      || null;
    this.port      = config.port        || 5060;
    this.transport = config.transport   || 'UDP';
//    this.lport     = config.lport       || utils.randomPort();
    this.lport     = config.lport       || null;
    this.srcHost   = config.srcHost;
    this.timeout   = config.timeout     || 8000;
    this.wsPath    = config.wsPath      || null;
    this.tlsType   = config.tlsType     || 'SSLv3';
    this.domain    = config.domain      || null;

    if (net.isIPv6(config.server) && !config.srcHost) {
        this.srcHost = utils.randomIP6();
    } else if (!config.srcHost) {
        this.srcHost = utils.randomIP();
    }
}


// Public functions

SipFakeStack.prototype.send = function (cfg, callback) {
    var self = this;

    function sendLport () {
        var socketCfg = {
                target    : self.server,
                port      : self.port,
                transport : self.transport,
                lport     : self.lport,
                timeout   : self.timeout ,
                wsProto   : 'sip',
                wsPath    : self.wsPath,
                tlsType   : self.tlsType
            },
            msgOptions = cfg;

        // Reusing options object
        msgOptions.lport     = self.lport;
        msgOptions.server    = self.server;
        msgOptions.srcHost   = self.srcHost;
        msgOptions.domain    = self.domain;
        msgOptions.transport = self.transport;

        self.megaSocket = new SteroidsSocket(socketCfg);

        self.megaSocket.on('error', function (err) {
            callback(err);
        });

        self.megaSocket.on('message', function (msg) {
            self.megaSocket.close();
            // SIP can be a binary or text protocol, but text widely used
            callback(null, {
                msg : msg.data.toString()
            });
        });

        self.megaSocket.send(createMessage(msgOptions));
    }

    // Trick needed to avoid problem with bussy ports in UDP (EADDINUSE)
    if (!this.lport) {
        randomPort(function (port) {
            self.lport = port;
            sendLport();
        });
    } else {
        sendLport();
    }
};

SipFakeStack.prototype.authenticate = function (config, callback) {
    var self = this;

    function authenticateLport () {
        var msgOptions   = config,
            firstTime    = true,
            valid        = false,
            // We need to know this values in advance to continue the transaction
            cseq         = 1,
            callId       = utils.randomString(16),
            toExt        = utils.randomString(3),
            // in case of webscokets
            gruuInstance = 'urn:uuid:' + utils.randomString(3) + '-' +
                            utils.randomString(4) + '-' + utils.randomString(8),
            socketCfg    = {
                target    : self.server,
                port      : self.port,
                transport : self.transport,
                lport     : self.lport,
                timeout   : self.timeout ,
                wsProto   : 'sip',
                wsPath    : self.wsPath,
                tlsType   : self.tlsType
            };

        // Reusing options object
        msgOptions.lport        = self.lport;
        msgOptions.server       = self.server;
        msgOptions.srcHost      = self.srcHost;
        msgOptions.domain       = self.domain;
        msgOptions.cseq         = cseq;
        msgOptions.callId       = callId;
        msgOptions.toExt        = toExt;
        msgOptions.gruuInstance = gruuInstance;

        self.megaSocket = new SteroidsSocket(socketCfg);

        self.megaSocket.on('error', function (err) {
            if (!firstTime) {
                err.second = true;
            }
            callback(err);
        });

        self.megaSocket.on('message', function (msg) {
            var response, resCode, parsedAuth;

            // TODO: We need to be more polite at the end of this function
            // (send ACKs, etc.) to avoid retryings
            self.megaSocket.close();

            if (!(msg && msg.data)) {
                callback({
                    type : 'Empty message, firstTime: ' + firstTime
                });
            } else {
                // SIP can be a binary or text protocol, but text widely used
                response = msg.data.toString();
                resCode  = sipParser.code(response);

                if (firstTime) {
                    firstTime = false;
                    if(['401', '407', '200'].indexOf(resCode) !== -1) {
                        if (resCode === '200') {
                            callback(null, {
                                message : 'User without authentication',
                                valid   : true,
                                data    : response
                            });
                        } else {
                            // Upgrading SIP fields
                            parsedAuth = sipParser.realmNonce(response);

                            if (parsedAuth) {
                                msgOptions.isProxy = parsedAuth.isProxy;
                                msgOptions.realm = parsedAuth.realm;
                                msgOptions.nonce = parsedAuth.nonce;
                                msgOptions.pass = config.pass;
                                msgOptions.cseq = cseq + 1;

                                self.megaSocket.send(createMessage(msgOptions));
                            } else {
                                callback(null, {
                                    message : 'Not expected SIP code (2nd res.)',
                                    valid   : false,
                                    data    : response
                                });
                            }
                        }
                    } else {
                        callback(null, {
                            message : 'Not expected SIP code (1st res.)',
                            valid   : false,
                            data    : response
                        });
                        self.megaSocket.close(); // just in case
                    }
                } else { // second time
                    if (['REGISTER', 'PUBLISH'].indexOf(config.meth) !== -1) {
                        if (resCode === '200') {
                            valid = true;
                        }
                    } else if (['401', '407'].indexOf(resCode) === -1) {
                        valid = true;
                    }
                    callback(null, {
                        message : 'Accepted',
                        valid   : valid,
                        data    : response
                    });
                }
            }
        });

        self.megaSocket.send(createMessage(msgOptions));
    }

    if (!this.lport) {
        randomPort(function (port) {
            self.lport = port;
            authenticateLport();
        });
    } else {
        authenticateLport();
    }

};

module.exports = SipFakeStack;
