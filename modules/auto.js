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

var async      = require('async'),
    lodash     = require('lodash'),
    fs         = require('fs'),
    hbs        = require('handlebars'),
    prettyjson = require('prettyjson'),
    moment     = require('moment'),
    shell      = require('shelljs'),

    packageJson   = require('../package.json'),
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
    sipBruteSlow  = require('./sipBruteSlow'),
    sipBruteExt   = require('./sipBruteExt'),
    sipBrutePass  = require('./sipBrutePass'),
    sipUnauthCall = require('./sipUnauthCall'),
    sipDos        = require('./sipDos'),
    blueTypes     = require('../utils/blueTypes'),
    sipParser     = require('../utils/sipParser'),
    printer       = require('../utils/printer'),
    utils         = require('../utils/utils'),

    // Statics
    CVE_URL           = 'http://www.cvedetails.com/product-search.php?vendor_id=0&search=',
    ROBTEX_IP_URL     = 'https://www.robtex.com/en/advisory/ip/',
    ROBTEX_DOMAIN_URL = 'http://www.robtex.com/en/advisory/dns/';


module.exports = (function () {

    return {

        info : {
            name : 'auto',
            description : 'Automated VoIP/UC pentesting.',
            options     : {
                targets : {
                    description  : 'IP or domain to explore',
                    defaultValue : '127.0.0.1',
//                    defaultValue : '172.16.190.128-132',
//                    defaultValue : '172.16.190.128',
                    type         : 'targetsDomain'
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
                sipDomain : {
                    description  : 'SIP domain to use in SIP requests ("ip" to use the target)',
                    defaultValue : 'ip',
                    type         : 'domainIp'
                },
                timeout : {
                    description  : 'Time to wait for a response (ms.)',
                    defaultValue : 5000,
                    type         : 'positiveInt'
                },
                nmapLocation : {
                    description  : 'Path of the nmap binary',
                    defaultValue : '/usr/local/bin/nmap',
                    type         : 'anyValue'
                },
                profile : {
                    description  : 'Type of scanning (quick, regular, aggressive, paranoid)',
                    defaultValue : 'regular',
                    type         : 'anyValue' // checked in runtime
                },
                reportPath : {
                    description  : 'File to store the final report',
                    defaultValue : './',
                    type         : 'anyValue'
                }
            }
        },

        run : function (options, callback) {
            var report         = {}, // finalReport: Object of Objects (hosts)
                initialTargets = [],
                profile;

            function makeScan (finalTarget, asyncCallback, bad) {
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
                        delay     : 0, // Not used, we're doing one scan per target
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

                        report[finalTarget.ip].responses.push(res[0]);
                    }
                    asyncCallback();
                });
            }

            // Getting the profile
            // TODO: Errors management
            profile = require('../artifacts/profiles/' + options.profile + '.json');
            printer.bold('Using "' + options.profile + '" profile:');
            printer.json(profile);

            async.series([
                function (async0Cb) {
                    if (blueTypes.isDomain(options.targets)) {
                        // TODO: Implement this!
                        printer.bold('\nEXPLORING THE DOMAIN');
                        printer.bold('\nGetting some info ...');
        //                whois.run({ domain : 'google.com' }, function (err, res) {
        //                    if (res) {
        //                        report[domain].whois = res;
        //                    }
        //                    async1Cb();
        //                });
                        // Robtex DOMAIN: https://www.robtex.com/en/advisory/dns/es/DOMAIN/
                        printer.bold('\nDNS brute-force ...\n');
                        printer.bold('\nDNS resolve ...\n');
                        initialTargets = [];
                        async0Cb();
                    } else {
                        initialTargets = utils.createAutoTargets(
                            options.targets,
                            profile.sipServices,
                            profile.goodScanTypes
                        );
                        async0Cb();
                    }
                },
                function (async0Cb) {
                    printer.bold('\n\nINITIAL SIP SCAN\n');
                    printer.bold('\nScanning ' + options.targets.length + ' targets ... (' +
                                 initialTargets.length + ' tries)\n');
                    async.eachLimit(
                        initialTargets,
                        profile.maxScanParallel,
                        makeScan,
                        function (err) {
                            if (Object.keys(report).length > 0) {
                                // Delete the
                                printer.bold('\n\nFROM HERE, WE EXPLORE EACH DISCOVERED HOST');
                                async0Cb(err); // error not thrown inside, but just in case
                            } else {
                                callback(null, {
                                    report : 'No target found'
                                });
                                async0Cb('No target found');
                            }
                        }
                    );
                },
                function (async0Cb) {
                    printer.bold('\nGetting some info about discovered targets\n');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        report[ipAddress].cveDetails = CVE_URL + report[ipAddress].service;
                        if (!utils.isReservedIp(ipAddress)) {
                            printer.infoHigh('Robtex ... (' + ipAddress + ')');
                            report[ipAddress].robtex = ROBTEX_IP_URL + ipAddress.split('.').join('/') + '/';
                        } else {
                            report[ipAddress].robtex = 'Reserved';
                        }
                        async.parallel([
                            function (async2Cb) {
                                if (!utils.isReservedIp(ipAddress)) {
                                    printer.infoHigh('Geolocation ... (' + ipAddress + ')');
                                    geoLocate.run({ target : ipAddress }, function (err, res) {
                                        if (res) {
                                            report[ipAddress].geolocation = res;
                                        }
                                        async1Cb();
                                    });
                                } else {
                                    report[ipAddress].geolocation = 'Reserved';
                                    async2Cb();
                                }
                            },
                            function (async2Cb) {
                                if (!utils.isReservedIp(ipAddress)) {
                                    printer.infoHigh('DNS reverse ... (' + ipAddress + ')');
                                    dnsReverse.run({ target : ipAddress }, function (err, res) {
                                        if (res) {
                                            report[ipAddress].dnsReverse = res;
                                        }
                                        async2Cb();
                                    });
                                } else {
                                    report[ipAddress].dnsReverse = 'Reserved';
                                    async2Cb();
                                }
                            },
                            function (async2Cb) {
                                printer.infoHigh('Ping ... (' + ipAddress + ')');
                                ping.run({ target : ipAddress }, function (err, res) {
                                    if (res) {
                                        report[ipAddress].ping = res;
                                    }
                                    async2Cb();
                                });
                            },
                            function (async2Cb) {
                                printer.infoHigh('Ping (TCP) ... (' + ipAddress + ')');
                                pingTcp.run({
                                    target   : ipAddress,
                                    port     : '5060',
                                    timeout  : 3000,
                                    attempts : 1
                                }, function (err, res) {
                                    if (res) {
                                        report[ipAddress].pingTcp = res;
                                    }
                                    async2Cb();
                                });
                            },
                            function (async2Cb) {
                                if (!utils.isReservedIp(ipAddress)) {
                                    printer.infoHigh('Traceroute ... (' + ipAddress + ')');
                                    traceroute.run({ target : ipAddress }, function (err, res) {
                                        if (res) {
                                            report[ipAddress].traceroute = res;
                                        }
                                        async2Cb();
                                    });
                                } else {
                                    report[ipAddress].traceroute = 'Reserved';
                                    async2Cb();
                                }
                            },
                            function (async2Cb) {
                                var query = '';

                                printer.infoHigh('Search exploits and vulns ... (' + ipAddress + ')');
                                if (report[ipAddress].service) {
                                    query += report[ipAddress].service;
                                    if (report[ipAddress].version) {
                                        query += ' ' + report[ipAddress].version;
                                    }
                                    exploitSearch.run({
                                        query        : query,
                                        timeout      : 5000,
                                        onlyExploits : false
                                    }, function (err, res) {
                                        if (res) {
                                            report[ipAddress].vulns = res;
                                        }
                                        async2Cb();
                                    });
                                }
                            },
                            function (async2Cb) {
                                if (!utils.isReservedIp(ipAddress)) {
                                    printer.infoHigh('SHODAN ... (' + ipAddress + ')');
                                    shodanHost.run({
                                        ip      : ipAddress,
                                        timeout : 5000
                                    }, function (err, res) {
                                        if (res) {
                                            report[ipAddress].indexShodan = res;
                                        }
                                        async1Cb();
                                    });
                                } else {
                                    report[ipAddress].shodanHost = 'Reserved';
                                    async2Cb();
                                }

                            }
                        ], function (err, results) {
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },

                // heavy tasks, we avoid to parallelize from here

                // (the ones not included in the initial scan)
                function (async0Cb) {
                    printer.bold('\nSending more types of SIP packets ...\n');
                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        async.eachLimit(
                            utils.createAutoTargets([ipAddress],
                                                    profile.sipServices,
                                                    profile.badScanTypes),
                            profile.maxScanParallel,
                            makeScan,
                            function (err) {
                                async1Cb(); // error never thrown inside
                            }
                        );
                    }, function (err) {
                        async0Cb();
                    });
                },

                // From here we, speaking about SIP stuff, we  only use the first responding
                // setup (port, transport, etc.)
                function (async0Cb) {
                    printer.bold('\nMaking unauthenticated calls ...');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        printer.bold('\n... to ' + ipAddress);
                        sipUnauthCall.run({
                            target    : ipAddress,
                            port      : report[ipAddress].responses[0].port,
                            transport : report[ipAddress].responses[0].transport,
                            wsPath    : report[ipAddress].responses[0].path || null,
                            tlsType   : report[ipAddress].responses[0].tlsType || null,
                            fromExt   : blueTypes.userPass(profile.unauthFrom),
                            toExt     : blueTypes.userPass(profile.unauthTo),
                            srcHost   : report[ipAddress].responses[0].srcHost || null,
                            srcPort   : report[ipAddress].responses[0].srcPort || null,
                            domain    : report[ipAddress].responses[0].domain || null,
                            delay     : profile.unauthDelay,
                            timeout   : options.timeout
                        }, function (err, res) {
                            if (res) {
                                report[ipAddress].sipUnauthCall = err || res;
                            }
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                function (async0Cb) {
                    var finalPairs = [];

                    printer.bold('\nSlow extension brute-force check ...');

                    lodash.each(profile.slowTypes, function (meth) {
                        lodash.each(Object.keys(report), function (ipAddress) {
                            finalPairs.push({
                                ipAddress : ipAddress,
                                meth      : meth
                            });
                        });
                    });

                    async.eachSeries(finalPairs, function (finalPair, async1Cb) {
                        printer.bold('\n... against ' + finalPair.ipAddress + ' (' + finalPair.meth + ')');
                        report[finalPair.ipAddress].sipSlowBrute = {};
                        sipBruteSlow.run({
                            target     : finalPair.ipAddress,
                            port       : report[finalPair.ipAddress].responses[0].port,
                            transport  : report[finalPair.ipAddress].responses[0].transport,
                            wsPath     : report[finalPair.ipAddress].responses[0].path || null,
                            tlsType    : report[finalPair.ipAddress].responses[0].tlsType || null,
                            meth       : finalPair.meth,
                            srcHost    : report[finalPair.ipAddress].responses[0].srcHost || null,
                            srcPort    : report[finalPair.ipAddress].responses[0].srcPort || null,
                            domain     : report[finalPair.ipAddress].responses[0].domain || null,
                            // 3 req/min is normally not considered an attack
                            delay      : profile.slowDelay,
                            timeout    : options.timeout
                        }, function (err, res) {
                            if (res) {
                                report[finalPair.ipAddress].sipSlowBrute[finalPair.meth] = err || res;
                            }
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                function (async0Cb) {
                    printer.bold('\nSending crafted SIP packets (SQLi) ...');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        printer.bold('\n... to ' + ipAddress);
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
                function (async0Cb) {
                    printer.bold('\nSending crafted SIP packets (SIP Torture) ...');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        printer.bold('\n... to ' + ipAddress);
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
                            report[ipAddress].sipTorture = err || res;
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                function (async0Cb) {
                    printer.bold('\nDenial of service (DoS) test ...');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        printer.bold('\n... against ' + ipAddress);
                        sipDos.run({
                            target    : ipAddress,
                            port      : report[ipAddress].responses[0].port,
                            transport : report[ipAddress].responses[0].transport,
                            wsPath    : report[ipAddress].responses[0].path || null,
                            tlsType   : report[ipAddress].responses[0].tlsType || null,
                            srcHost   : report[ipAddress].responses[0].srcHost || null,
                            srcPort   : report[ipAddress].responses[0].srcPort || null,
                            domain    : report[ipAddress].responses[0].domain || null,
                            numReq    : profile.dosNumReq, // enough to see if the target is blocking us
                            delay     : profile.dosDelay,
                            timeout   : options.timeout
                        }, function (err, res) {
                            if (res) {
                                report[ipAddress].DoS = err || res;
                            }
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                function (async0Cb) {
                    printer.bold('\nScanning another common services ...');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        printer.bold('\n... in ' + ipAddress);
                        nmapScan.run({
                            targets : ipAddress,
                            ports   : profile.commonPorts,
                            binPath : options.nmapLocation,
                        }, function (err, res) {
                            if (res) {
                                printer.json(res);
                                report[ipAddress].nmap = err || res[0][0].ports;
                            }
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                function (async0Cb) {
                    var finalTargets = [];

                    printer.bold('\nSIP extension brute-force ...');

                    // We're testing these three because the servers sometimes answer different to them
                    lodash.each(profile.bruteExtTypes, function (meth) {
                        lodash.each(Object.keys(report), function (ipAddress) {
                            finalTargets.push({
                                ipAddress : ipAddress,
                                meth      : meth
                            });
                        });
                    });

                    async.eachSeries(finalTargets, function (finalPair, async1Cb) {
                        var lastMeth;

                        printer.bold('\n... into ' + finalPair.ipAddress + ' (' + finalPair.meth + ')');
                        if (!report[finalPair.ipAddress].sipBruteExt) {
                            report[finalPair.ipAddress].sipBruteExt = {};
                        }
                        sipBruteExt.run({
                            target     : finalPair.ipAddress,
                            port       : report[finalPair.ipAddress].responses[0].port,
                            transport  : report[finalPair.ipAddress].responses[0].transport,
                            wsPath     : report[finalPair.ipAddress].responses[0].path || null,
                            tlsType    : report[finalPair.ipAddress].responses[0].tlsType || null,
                            extensions : blueTypes.userPass(profile.bruteExtensions),
                            meth       : finalPair.meth,
                            srcHost    : report[finalPair.ipAddress].responses[0].srcHost || null,
                            srcPort    : report[finalPair.ipAddress].responses[0].srcPort || null,
                            domain     : report[finalPair.ipAddress].responses[0].domain || null,
                            delay      : profile.bruteExtDelay,
                            timeout    : options.timeout
                        }, function (err, res) {
                            report[finalPair.ipAddress].sipBruteExt[finalPair.meth] = err || res;
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
                function (async0Cb) {
                    printer.bold('\nSIP passwords brute-force ...');

                    async.eachSeries(Object.keys(report), function (ipAddress, async1Cb) {
                        var finalExtensions = [];

                        // Looking if any valid extension was found in the last step
                        lodash.each(profile.bruteExtTypes, function (type) {
                            if (report[ipAddress].sipBruteExt &&
                                report[ipAddress].sipBruteExt[type] &&
                                report[ipAddress].sipBruteExt[type].valid) {
                                lodash.each(report[ipAddress].sipBruteExt[type].valid, function (extObj) {
                                    finalExtensions.push(extObj.extension);
                                });
                            }
                        });
                        // removing duplicates
                        finalExtensions = lodash.unique(finalExtensions);
                        // If no valid extension found we use some common ones to brute-force
                        if (finalExtensions.length === 0) {
                            finalExtensions = blueTypes.userPass(profile.brutePassExts);
                        }

                        printer.bold('\n... into ' + ipAddress);
                        report[ipAddress].sipBrutePass = {};
                        sipBrutePass.run({
                            target      : ipAddress,
                            port        : report[ipAddress].responses[0].port,
                            transport   : report[ipAddress].responses[0].transport,
                            wsPath      : report[ipAddress].responses[0].path || null,
                            tlsType     : report[ipAddress].responses[0].tlsType || null,
                            extensions  : finalExtensions,
                            passwords   : blueTypes.userPass(profile.brutePassPasses),
                            userAsPass  : profile.bruteUserAsPass,
                            meth        : 'REGISTER',
                            srcHost     : report[ipAddress].responses[0].srcHost || null,
                            srcPort     : report[ipAddress].responses[0].srcPort || null,
                            domain      : report[ipAddress].responses[0].domain || null,
                            delay       : profile.brutePassDelay,
                            timeout     : options.timeout
                        }, function (err, res) {
                            report[ipAddress].sipBrutePass = err || res;
                            async1Cb();
                        });
                    }, function (err) {
                        async0Cb();
                    });
                },
            ],
            // optional callback
            function (err, res) {
                var reportPath     = options.reportPath + 'finalReport.json',
                    reportPathHtml = options.reportPath + 'finalReport.html',
                    data           = {
                        report : JSON.stringify(report)
                    },
                    templatePath   = '../artifacts/reportTemplates/default.hbs',
                    templateFile   = fs.readFileSync(templatePath, 'utf8'),
                    reportHtml, template;

                fs.writeFile(reportPath, JSON.stringify(report), function (err) {
                    if (err) {
                        printer.error('\nWriting the final report (JSON): ' + JSON.stringify(err));
                        callback(err);
                    } else {
                        printer.bold('\nThe final report (JSON) was written to the file:');
                        printer.highlight(reportPath);
                        printer.info('You can easily inspect it at: https://warfares.github.io/pretty-json/');

                        // Creating the final HTML report
                        template = hbs.compile(templateFile);
                        reportHtml = template({
                            report  : JSON.stringify(report),
                            date    : moment().format('MMMM Do YYYY, h:mm:ss a'),
                            profile : options.profile,
                            version : packageJson.version
                        });
                        fs.writeFile(reportPathHtml, reportHtml, function (err) {
                            if (err) {
                                printer.error('\nWriting the final report (HTML): ' + JSON.stringify(err));
                                callback(err);
                            } else {
                                printer.bold('\nThe final report (HTML) was written to the file:');
                                printer.highlight(reportPathHtml);

                                // opening the report
                                shell.exec('open ' + reportPathHtml, { silent : true }, function (code, output) {
                                    if (code === 127) {
                                        printer.error('ERROR: module/command not found');
                                    }
                                });

                                callback(null, { report : reportPathHtml });
                            }
                        });

                    }
                });

            });

        } // end run

    }; // end return

}());
