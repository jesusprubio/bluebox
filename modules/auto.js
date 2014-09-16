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
    lodash = require('lodash'),

    sipScan       = require('./sipScan'),
    geoLocate     = require('./geoLocate'),
    whois         = require('./whois'),
    traceroute    = require('./traceroute'),
    ping          = require('./ping'),
    pingTcp       = require('./pingTcp'),
    exploitSearch = require('./exploitSearch'),
    shodanHost    = require('./shodanHost'),
    nmapScan      = require('./nmapScan'),
    dnsReverse    = require('./dnsReverse'),
    sipSqli       = require('./sipSqli'),
    sipTorture    = require('./sipTorture'),
    sipBruteExt   = require('./sipBruteExt'),
    sipBrutePass  = require('./sipBrutePass'),
    sipDos        = require('./sipDos'),
    sipParser     = require('../utils/sipParser'),
    printer       = require('../utils/printer'),
    utils         = require('../utils/utils'),

    // Statics
    // All which we support brute-forcing
    // Statics
    CVE_URL           = 'http://www.cvedetails.com/product-search.php?vendor_id=0&search=',
    ROBTEX_IP_URL     = 'https://www.robtex.com/en/advisory/ip/',
    ROBTEX_DOMAIN_URL = 'http://www.robtex.com/en/advisory/dns/',
    VOIP_PORTS        = '21,22,23,80,69,389,443,3306,4443,4444,5038,5060-5070,8080,27017';


// Private helpers

function genTargets (ips, customServices, sipTypes) {
    var targets = [];

    // Getting all combinations
    lodash.each(ips, function (target) {
        lodash.each(customServices, function (sipService) {
            // All requeqs which the server could answer at
            lodash.each(sipTypes, function (meth) {
                if (sipService.transport === 'TLS') {
                    lodash.each(utils.getTlsTypes(), function (tlsVersion) {
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
}


// Module core

module.exports = (function () {

    return {

        info : {
            name : 'auto',
            description : 'Automated VoIP/UC pentesting.',
            options     : {
                // TODO: Add domain
                targets : {
                    description  : 'IP address to explore',
//                    defaultValue : '172.16.190.0/24',
//                    defaultValue : '172.16.190.128-130',
                    defaultValue : '172.16.190.128',
                    type         : 'targets'
                },
                srcHost : {
                    description  : 'Source host to include in the  SIP request',
                    defaultValue : 'random',
                    type         : 'targetIpRand'
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
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 3000,
                    type         : 'positiveInt'
                },
                bruteExt : {
                    description  : 'Try to brute-force SIP extensions for discovered services',
                    defaultValue : 'yes',
                    type         : 'yesNo'
                },
                brutePass : {
                    description  : 'Try to brute-force SIP passwords for discovered services and extensions',
                    defaultValue : 'no',
                    type         : 'yesNo'
                },
                discoverServices : {
                    description  : 'Try to discover other common services present in VoIP' +
                                   ' servers (Asterisk Manager, SSH, MySQL, HTTP, etc.)',
                    defaultValue : 'yes',
                    type         : 'yesNo'
                },
                bruteServices : {
                    description  : 'Try to brute-force credentials for discovered services',
                    defaultValue : 'no',
                    type         : 'yesNo'
                },
                pdfReport : {
                    description  : 'Generate a the report also in .pdf format (default in Markdown)',
                    defaultValue : 'yes',
                    type         : 'yesNo'
                }
            }
        },

        run : function (options, callback) {
            var report        = {}, // finalReport: Object of Objects (hosts)
                // TODO: Move to a config file -> PROFILESS
                sipServices = [
                    {
                        port : '5060',
                        transport : 'UDP'
                    },
                    {
                        port : '5060',
                        transport : 'TCP'
                    },
                    {
                        port : '5061',
                        transport : 'TLS'
                    },
                    {
                        port : '80',
                        transport : 'WS'
                    },
                    {
                        port : '8080',
                        transport : 'WS'
                    },
                    {
                        port : '443',
                        transport : 'WSS'
                    },
                    {
                        port : '4443',
                        transport : 'WSS'
                    }
                ],
                initialTargets = [];

            function makeScan (finalTarget, asyncCallback) {
                var sipScanCfg = {
                        targets   : [finalTarget.ip],
                        ports     : [finalTarget.port],
                        transport : finalTarget.transport,
                        wsPath    : finalTarget.wsPath || null,
                        meth      : finalTarget.meth,
                        tlsType   : finalTarget.tlsType || null,
                        srcHost   : options.srcHost || null,
                        srcPort   : options.srcPort || null,
                        domain    : options.domain || null,
                        delay     : 'async',
                        timeout   : options.timeout
                    };

                sipScan.run(sipScanCfg, function (err, res) {
                    // We only want online servers which anser our requests
                    if (!err && res && res.length !== 0) {
                        // This host still wasn't included in the report
                        // TODO: Check that all transports/ports answer with the same agent
                        if (!report[finalTarget.ip]) {
                            report[finalTarget.ip] = {
                                service   : res[0].service,
                                version   : res[0].version,
                                auth      : res[0].auth,
                                responses : []
                            };
                        }

                        delete res[0].host;

                        // TODO: Uncomment!!!!
                        report[finalTarget.ip].responses.push(res[0]);
                    }
                    asyncCallback();
                });
            }

            initialTargets = genTargets(
                                options.targets,
                                sipServices,
                                ['OPTIONS', 'REGISTER', 'INVITE', 'MESSAGE',
                                 'BYE', 'NOTIFY', 'PUBLISH', 'SUBSCRIBE']);


            printer.bold('\nSCANNING ' + options.targets.length + ' TARGETS ... (' +
                         initialTargets.length + ' tries) \n');

            async.series([
                // TODO: Only if domain
//                whois.run({ domain : 'google.com' }, function (err, res) {
//                    if (res) {
//                        report[domain].whois = res;
//                    }
//                    async1Cb();
//                });
                // Robtex DOMAIN: https://www.robtex.com/en/advisory/dns/es/igalia/

                // ---------- Initial scan ----------
                function (async0Cb) {
                    async.eachLimit(
                        initialTargets,
                        1, // TODO: Performance!
                        makeScan,
                        function (err) {
                            async0Cb(err); // error not thrown inside, but just in case
                        }
                    );
                },
//                // ---------- Get different info about the discovered targets ----------
//                function (async0Cb) {
//                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
//                        report[ipAddress].cveDetails = CVE_URL + report[ipAddress].service;
//                        if (!utils.isReservedIp(ipAddress)) {
//                            report[ipAddress].robtex = ROBTEX_IP_URL + ipAddress.split('.').join('/') + '/';
//                        } else {
//                            report[ipAddress].robtex = 'Reserved';
//                        }
//                        // TODO: Refactor! Move out here
//                        async.parallel([
//                            function (async1Cb) {
//                                if (!utils.isReservedIp(ipAddress)) {
//                                    geoLocate.run({ target : ipAddress }, function (err, res) {
//                                        if (res) {
//                                            report[ipAddress].geolocation = res;
//                                        }
//                                        async1Cb();
//                                    });
//                                } else {
//                                    report[ipAddress].geolocation = 'Reserved';
//                                    async1Cb();
//                                }
//                            },
//                            function (async1Cb) {
//                                if (!utils.isReservedIp(ipAddress)) {
//                                    dnsReverse.run({ target : ipAddress }, function (err, res) {
//                                        if (res) {
//                                            report[ipAddress].dnsReverse = res;
//                                        }
//                                        async1Cb();
//                                    });
//                                } else {
//                                    report[ipAddress].dnsReverse = 'Reserved';
//                                    async1Cb();
//                                }
//                            },
//                            function (async1Cb) {
//                                ping.run({ target : ipAddress }, function (err, res) {
//                                    if (res) {
//                                        report[ipAddress].ping = res;
//                                    }
//                                    async1Cb();
//                                });
//                            },
//                            function (async1Cb) {
//                                pingTcp.run({
//                                    target   : ipAddress,
//                                    port     : '5060',
//                                    timeout  : 3000,
//                                    attempts : 1
//                                }, function (err, res) {
//                                    if (res) {
//                                        report[ipAddress].pingTcp = res;
//                                    }
//                                    async1Cb();
//                                });
//                            },
//                            function (async1Cb) {
//                                if (!utils.isReservedIp(ipAddress)) {
//                                    traceroute.run({ target : ipAddress }, function (err, res) {
//                                        if (res) {
//                                            report[ipAddress].traceroute = res;
//                                        }
//                                        async1Cb();
//                                    });
//                                } else {
//                                    report[ipAddress].traceroute = 'Reserved';
//                                    async1Cb();
//                                }
//                            },
//                            function (async1Cb) {
//                                exploitSearch.run({
//                                    query        : report[ipAddress].service + ' ' +
//                                                   report[ipAddress].version,
//                                    timeout      : 5000,
//                                    onlyExploits : false
//                                }, function (err, res) {
//                                    if (res) {
//                                        report[ipAddress].vulns = res;
//                                    }
//                                    async1Cb();
//                                });
//                            },
//                            function (async1Cb) {
//                                if (!utils.isReservedIp(ipAddress)) {
//                                    shodanHost.run({
//                                        ip      : ipAddress,
//                                        timeout : 5000
//                                    }, function (err, res) {
//                                        if (res) {
//                                            report[ipAddress].indexShodan = res;
//                                        }
//                                        async1Cb();
//                                    });
//                                } else {
//                                    report[ipAddress].dnsReverse = 'Reserved';
//                                    async1Cb();
//                                }
//
//                            }
//                        ],
//                        // optional callback
//                        function(err, results){
//                            async0Cb();
//                        });
//                    });
//                },
                // heavy tasks, we avoid to parallelize from here
                //  ---------- Check if the server answer to the rest of the types ----------
                // (not used in the initial scan)
                function (async0Cb) {
                    // For all dicovered hosts
                    // TODO: Uncomment
                    async0Cb();
//                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
//                        async.eachLimit(
//                            genTargets([ipAddress], sipServices, ['CANCEL', 'ACK', 'Trying', 'Ringing', 'OK']),
//                            1, // TODO: Performance!
//                            makeScan,
//                            function (err) {
//                                async1Cb(); // error never thrown inside
//                            }
//                        );
//                    }, function (err) {
//                        async0Cb();
//                    });
                },

                // From here we, speaking about SIP stuff, we  only use the first responding
                // setup (port, transport, etc.)

                // TODO: ADD SIPUNAUTH

                // SLOW ATTACKS (EXTENSION Y PASS) AQUÍ, con un poco de suerte no nos bloquearon aun


                // ---------- SQLi check ----------
                // http://www.cs.columbia.edu/~dgen/papers/conferences/conference-02.pdf
                function (async0Cb) {
                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        if (report[ipAddress].auth) {
                            var fakeRealm = report[ipAddress].responses[0].domain || ipAddress,
                                sipSqliCfg = {
                                    target    : ipAddress,
                                    port      : report[ipAddress].responses[0].port,
                                    transport : report[ipAddress].responses[0].transport,
                                    wsPath    : report[ipAddress].responses[0].path || null,
                                    tlsType   : report[ipAddress].responses[0].tlsType || null,
                                    srcHost   : report[ipAddress].responses[0].srcHost || null,
                                    srcPort   : report[ipAddress].responses[0].srcPort || null,
                                    domain    : report[ipAddress].responses[0].domain || null,
                                    timeout   : options.timeout
                                };

                            sipSqli.run(sipSqliCfg, function (err, res) {
                                report[ipAddress].sqli = err || res;
                                async1Cb();
                            });
                        } else {
                            async1Cb();
                        }
                    }, function (err) {
                        async0Cb();
                    });
                },
                // ---------- Crafted packets check (SIP Torture) ----------
                function (async0Cb) {
                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        var fakeRealm     = report[ipAddress].responses[0].domain || ipAddress,
                            sipTortureCfg = {
                                target    : ipAddress,
                                port      : report[ipAddress].responses[0].port,
                                transport : report[ipAddress].responses[0].transport,
                                wsPath    : report[ipAddress].responses[0].path || null,
                                tlsType   : report[ipAddress].responses[0].tlsType || null,
                                srcHost   : report[ipAddress].responses[0].srcHost || null,
                                srcPort   : report[ipAddress].responses[0].srcPort || null,
                                domain    : report[ipAddress].responses[0].domain || null,
                                timeout   : options.timeout
                            };

                        sipTorture.run(sipTortureCfg, function (err, res) {
                            report[ipAddress].torture = err || res;
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                // ---------- Nmap scanning ----------
                function (async0Cb) {
                    // For all dicovered hosts
                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        nmapScan.run({
                            targets : ipAddress,
                            ports   : [21, 22, 23, 80, 69, 389, 443, 3306, 5038, 27017],
                            binPath : '/usr/local/bin/nmap'
                        }, function (err, res) {
                            if (res) {
                                report[ipAddress].nmap = res;
                            }
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                // ---------- DoS check ( 100 aleat, BORRAR ESTO) ----------

                // ALL BRUTE-FORCE FROM HERE
                function (async0Cb) {
                    console.log('LASSSSTTT STEPPPP');

                    async0Cb();
                }

            ],
            // optional callback
            function (err, res) {
                // TODO: WRITE THE REPORT TO A FILE (WITH DE DATA IN THE NAME)
                // TODO: Analyze results (impact, etc)
                // TODO: Add the mitigation techniques in each case
                // convert to  html with prottyjson + 2 pijadas (título y poco más, si eso poner como título el nombre y meter el json dentro)
                callback(err, report);
            });

        } // end run

    }; // end return

}());
