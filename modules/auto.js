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

    sipScan = require('./sipScan'),
    sipParser    = require('../utils/sipParser'),
    printer      = require('../utils/printer'),
    utils        = require('../utils/utils'),

    // Statics
    CVEURL       = 'http://www.cvedetails.com/product-search.php?vendor_id=0&search=',
    // All which we support brute-forcing
    VOIP_PORTS   = '21,22,23,80,69,389,443,3306,4443,4444,5038,5060-5070,8080,27017';


// Private helpers


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
                    defaultValue : '127.0.0.1',
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
                delay : {
                    description  : 'Delay between requests in ms. ("async" to concurrent)',
                    defaultValue : 0,
                    type         : 'positiveInt'
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
                                   'servers ("AMI", "SSH", MySQL, HTTP, etc.)',
                    defaultValue : 'yes',
                    type         : 'yesNo'
                },
                bruteServices : {
                    description  : 'Try to brute-force credentials for discovered services',
                    defaultValue : 'no',
                    type         : 'yesNo'
                },
                report : {
                    description  : 'Generate a Markdown report once the work is done',
                    defaultValue : 'yes',
                    type         : 'yesNo'
                }
            }
        },

        run : function (options, callback) {
            var result        = [], // finalReport
                finalTargets  = [],
                sipReqTypes   = utils.getSipReqs(),
                sipServices = [
                    {
                        port : '5060-5070',
                        transport : 'UDP'
                    },
                    {
                        port : '5060-5070',
                        transport : 'TCP'
                    },
                    {
                        port : '5061-5070',
                        transport : 'TLS'
                    },
                    {
                        port : '80,8080',
                        transport : 'WS'
                    },
                    {
                        port : '443,4443',
                        transport : 'WSS'
                    }
                ];


            // Getting all combinations
            lodash.each(options.targets, function (target) {
                lodash.each(sipServices, function (sipService) {
                    lodash.each(sipReqTypes, function (meth) {
                        if (sipService.transport === 'TLS') {
                            lodash.each(utils.getTlsTypes(), function (tlsVersion) {
                                finalTargets.push({
                                    ip        : target,
                                    port      : sipService.port,
                                    transport : sipService.transport,
                                    meth      : meth,
                                    tlsType   : tlsVersion
                                });
                            });
                        } else if(sipService.transport === 'WS' || sipService.transport === 'WS') {
                            lodash.each(['', 'ws'], function (wsPath) {
                                finalTargets.push({
                                    ip        : target,
                                    port      : sipService.port,
                                    transport : sipService.transport,
                                    meth      : meth,
                                    wsPath    : wsPath
                                });
                            });
                        } else {
                            finalTargets.push({
                                ip        : target,
                                port      : sipService.port,
                                transport : sipService.transport,
                                meth      : meth,
                            });
                        }
                    });
                });
            });


            console.log('NUMBER OF TARGETS: ' + finalTargets.length);


            //            async.series que llame a funciones que hagan esto, creo que hay k pasarle
            // el result actualizado con lo que se consiguió en ese paso al siguiente, comprobar
//        async.eachSeries(
//            geolocate, shodanhost, WHOIS, TRACEROUTE, ping, pingtcp to 80,5060,5061,
// Luego, con version las vulns con exploitsearch
            // Luego TODO SIP
            //  - SIPBRUTE EXT PARA LOS DESCUBIERTOS, si hay varios solo en uno de momento y poner comentario
            //  - SIP BRUTE PASS para las ips descubiertas, si no hubo ninguna probar con una lista estándar de usuarios. ME JODIA MUCHO PARARME EN ESTE PASO.

            // En paralelo (estamos haciendo todo en serie podemos paralelizar así): Luego scanemos con nmap los comunes para las ips descubiertas (quitamos los ya descubiertos).
            //LO de bruteforcear en paralelo con el bruteforcig de sip no, solo el escaneo.
            // Para los servicios descubiertos (cada uno en su puerto por defecto) bruteforceamos
            // Luego hacemos el informe con markdon a partir del json y luego el pdf a partir del markdown

            // TODO: Performance!!
            async.eachSeries(
                finalTargets,
                function (finalTarget, asyncCb) {
                    var sipScanCfg = {
                            targets   : finalTarget.ip,
                            ports     : finalTarget.port,
                            transport : finalTarget.transport,
                            wsPath    : finalTarget.wsPath || null,
                            meth      : finalTarget.meth,
                            tlsType   : finalTarget.tlsType || null,
                            srcHost   : options.srcHost || null,
                            srcPort   : options.srcPort || null,
                            domain    : options.domain || null,
                            delay     : options.delay,
                            timeout   : options.timeout
                        };

                    sipScan.run(sipScanCfg, function (err, res) {
                        if (err) {
                            console.log('ERROR:');
                            console.log(err);
                        } else {
                            console.log('RESULT:');
                            console.log(res);
                        }
                    });
                }
            );

        } // end run

    }; // end return

}());
