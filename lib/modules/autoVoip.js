// Copyright Jesus Perez <jesusprubio gmail com>
//           Sergio Garcia <s3rgio.gr gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/* eslint no-param-reassign: ["error", { "props": false }] */

'use strict';

// TODO: Refactor the whole module, this is crap

const async = require('async');
const lodash = require('lodash');
const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');
const moment = require('moment');
const shell = require('shelljs');
const sipScan = require('./sipScan');
const geoLocate = require('./geolocation');
// const whois = require('./whois');
const traceroute = require('./traceroute');
const ping = require('./ping');
const pingTcp = require('./pingTcp');
const exploitSearch = require('./exploitSearch');
const shodanHost = require('./shodanHost');
const nmapScan = require('./nmap');
const dnsReverse = require('./dnsReverse');
const sipSqli = require('./sipSqli');
const sipTorture = require('./sipTorture');
const sipBruteExt404 = require('./sipBruteExt404');
const sipBruteExt100 = require('./sipBruteExt100');
const sipBrutePass = require('./sipBrute');
const sipBruteSlow = require('./sipBruteSlow');
const sipUnauthCall = require('./sipUnauthCall');
const sipDos = require('./sipDos');
const blueTypes = require('../utils/types');
const logger = require('../utils/logger');
const utils = require('../utils/common');
const networkUtils = require('../utils/network');

const CVE_URL = 'http://www.cvedetails.com/product-search.php?vendor_id=0&search=';
const ROBTEX_IP_URL = 'https://www.robtex.com/en/advisory/ip/';
// const  ROBTEX_DOMAIN_URL = 'http://www.robtex.com/en/advisory/dns/';
const PKG_INFO = require('../../package.json');

module.exports.help = {
  description: 'Automated VoIP/UC pentesting',
  options: {
    targets: {
      type: 'ips',
      // description: 'Hosts or domain to explore',
      description: 'Hosts to explore',
      defaultValue: '127.0.0.1',
      // defaultValue: '172.16.190.128'
      // defaultValue : '172.16.190.128-132'
    },
    srcHost: {
      type: 'srcHost',
      description: 'Source host to include in the  SIP request ' +
                   '("external" and "random" supported)',
      defaultValue: 'iface:eth0',
      // defaultValue: 'iface:en0'
    },
    srcPort: {
      type: 'srcPort',
      description: 'Source port to include in the  SIP request ("random" supported)',
      defaultValue: 'real',
    },
    domain: {
      type: 'domainIp',
      description: 'Domain to explore ("ip" to use the target)',
      defaultValue: 'ip',
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 5000,
    },
    nmapLocation: {
      type: 'allValid', // checked in runtime
      description: 'Path of the nmap binary',
      defaultValue: '/usr/local/bin/nmap',
    },
    profile: {
      type: 'allValid',
      description: 'Type of scanning (quick, regular, aggressive, paranoid) or custom ' +
      'file (file:...)',
      defaultValue: 'regular',
      // defaultValue: 'debug'
    },
    reportPath: {
      type: 'allValid',
      description: 'File to store the final report',
      defaultValue: './',
    },
  },
};


module.exports.run = (options, callback) => {
  const report = {}; // finalReport: Object of Objects (hosts)
  let initialTargets = [];

  function makeScan(finalTarget, asyncCallback) {
    const sipScanCfg = {
      targets: [finalTarget.ip],
      ports: [finalTarget.port],
      transport: finalTarget.transport,
      wsPath: finalTarget.wsPath || null,
      meth: finalTarget.meth,
      srcHost: options.srcHost || null,
      srcPort: options.srcPort || null,
      domain: options.domain || null,
      delay: 0, // Not used, we're doing one scan per target
      timeout: options.timeout,
    };

    sipScan.run(sipScanCfg, (err, res) => {
      // We only want online servers which anser our requests
      if (!err && res && res.length !== 0) {
        // This host still wasn't included in the report
        // TODO: Check that all transports/ports answer with the same agent
        if (!report[finalTarget.ip]) {
          report[finalTarget.ip] = {
            service: res[0].service,
            version: res[0].version,
            auth: res[0].auth,
            responses: [],
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
  const profileUri = `../artifacts/profiles/${options.profile}.json`;
  const profile = require(profileUri); // eslint-disable-line global-require
  logger.bold(`Using "${options.profile}" profile:`);
  logger.json(profile);

  async.series([
    async0Cb => {
      // TODO: Domain support
      // if (blueTypes.isDomain(options.targets)) {
      // logger.bold('\nEXPLORING THE DOMAIN');
      // logger.bold('\nGetting some info ...');
      // whois.run({ domain : 'google.com' }, function (err, res) {
      // Robtex DOMAIN: https://www.robtex.com/en/advisory/dns/es/DOMAIN/
      // logger.bold('\nDNS brute-force ...\n');
      // logger.bold('\nDNS resolve ...\n');
      // initialTargets = [];
      // async0Cb();
      // } else {
      initialTargets = utils.createAutoTargets(
        options.targets,
        profile.sipServices,
        profile.goodScanTypes
      );
      async0Cb();
    },
    async0Cb => {
      logger.bold('\n\nINITIAL SIP SCAN\n');
      logger.bold(`\nScanning ${options.targets.length} targets ... 
        (${initialTargets.length} tries)\n`);
      async.eachSeries(
        initialTargets,
        makeScan,
        err => {
          if (Object.keys(report).length > 0) {
            // Delete the
            logger.bold('\n\nFROM HERE, WE EXPLORE EACH DISCOVERED HOST');
            async0Cb(err); // error not thrown inside, but just in case
          } else {
            callback(null, {
              report: 'No target found',
            });
            async0Cb('No target found');
          }
        }
      );
    },
    async0Cb => {
      logger.bold('\nGetting some info about discovered targets\n');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        report[ipAddress].cveDetails = CVE_URL + report[ipAddress].service;
        if (!networkUtils.isReservedIp(ipAddress)) {
          logger.infoHigh(`Robtex ... (${ipAddress})`);
          report[ipAddress].robtex = `${ROBTEX_IP_URL}${ipAddress.split('.').join('/')}/`;
        } else {
          report[ipAddress].robtex = 'Reserved';
        }
        async.parallel([
          async2Cb => {
            if (!networkUtils.isReservedIp(ipAddress)) {
              logger.infoHigh(`Geolocation ... (${ipAddress})`);
              geoLocate.run({ target: ipAddress }, (err, res) => {
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
          async2Cb => {
            if (!networkUtils.isReservedIp(ipAddress)) {
              logger.infoHigh(`DNS reverse ... (${ipAddress})`);
              dnsReverse.run({ target: ipAddress }, (err, res) => {
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
          async2Cb => {
            logger.infoHigh(`Ping ... (${ipAddress})`);
            ping.run({ target: ipAddress }, (err, res) => {
              if (res) {
                report[ipAddress].ping = res;
              }
              async2Cb();
            });
          },
          async2Cb => {
            logger.infoHigh(`Ping (TCP) ... (${ipAddress})`);
            pingTcp.run({
              target: ipAddress,
              port: '5060',
              timeout: 3000,
              attempts: 1,
            }, (err, res) => {
              if (res) {
                report[ipAddress].pingTcp = res;
              }
              async2Cb();
            });
          },
          async2Cb => {
            if (!networkUtils.isReservedIp(ipAddress)) {
              logger.infoHigh(`Traceroute ... (${ipAddress})`);
              traceroute.run({ target: ipAddress }, (err, res) => {
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
          async2Cb => {
            let query = '';

            logger.infoHigh(`Search exploits and vulns ... (${ipAddress})`);
            if (report[ipAddress].service) {
              query += report[ipAddress].service;
              if (report[ipAddress].version) {
                query += ` ${report[ipAddress].version}`;
              }
              exploitSearch.run({
                query,
                timeout: 5000,
                onlyExploits: false,
              }, (err, res) => {
                if (res) {
                  report[ipAddress].vulns = res;
                }
                async2Cb();
              });
            }
          },
          async2Cb => {
            if (!networkUtils.isReservedIp(ipAddress)) {
              logger.infoHigh(`SHODAN ... (${ipAddress})`);
              shodanHost.run({
                ip: ipAddress,
                timeout: 5000,
              }, (err, res) => {
                if (res) {
                  report[ipAddress].indexShodan = res;
                }
                async1Cb();
              });
            } else {
              report[ipAddress].shodanHost = 'Reserved';
              async2Cb();
            }
          },
        ], () => {
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },

    // heavy tasks, we avoid to parallelize from here

    // (the ones not included in the initial scan)
    async0Cb => {
      logger.bold('\nSending more types of SIP packets ...\n');
      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        async.eachSeries(
          utils.createAutoTargets([ipAddress], profile.sipServices, profile.badScanTypes),
          makeScan,
          () => {
            async1Cb(); // error never thrown inside
          }
        );
      }, () => {
        async0Cb();
      });
    },

    // From here we, speaking about SIP stuff, we  only use the first responding
    // setup (port, transport, etc.)
    async0Cb => {
      logger.bold('\nMaking unauthenticated calls ...');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        logger.bold(`\n... to ${ipAddress}`);
        sipUnauthCall.run({
          target: ipAddress,
          port: report[ipAddress].responses[0].port,
          transport: report[ipAddress].responses[0].transport,
          wsPath: report[ipAddress].responses[0].path || null,
          fromExt: blueTypes.userPass(profile.unauthFrom),
          toExt: blueTypes.userPass(profile.unauthTo),
          srcHost: report[ipAddress].responses[0].srcHost || null,
          srcPort: report[ipAddress].responses[0].srcPort || null,
          domain: report[ipAddress].responses[0].domain || null,
          delay: profile.unauthDelay,
          timeout: options.timeout,
        }, (err, res) => {
          if (res) {
            report[ipAddress].sipUnauthCall = err || res;
          }
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      const finalPairs = [];

      logger.bold('\nSlow extension brute-force check ...');

      lodash.each(profile.slowTypes, meth => {
        lodash.each(Object.keys(report), ipAddress => {
          finalPairs.push({
            ipAddress,
            meth,
          });
        });
      });

      async.eachSeries(finalPairs, (finalPair, async1Cb) => {
        logger.bold(`\n... against ${finalPair.ipAddress} (${finalPair.meth})`);
        report[finalPair.ipAddress].sipSlowBrute = {};
        sipBruteSlow.run({
          target: finalPair.ipAddress,
          port: report[finalPair.ipAddress].responses[0].port,
          transport: report[finalPair.ipAddress].responses[0].transport,
          wsPath: report[finalPair.ipAddress].responses[0].path || null,
          extensions: blueTypes.userPass(profile.slowExtensions),
          meth: finalPair.meth,
          srcHost: report[finalPair.ipAddress].responses[0].srcHost || null,
          srcPort: report[finalPair.ipAddress].responses[0].srcPort || null,
          domain: report[finalPair.ipAddress].responses[0].domain || null,
          // 3 req/min is normally not considered an attack
          // delay: profile.slowDelay,
          delay: 0,
          timeout: options.timeout,
        }, (err, res) => {
          if (res) {
            report[finalPair.ipAddress].sipSlowBrute[finalPair.meth] = err || res;
          }
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      logger.bold('\nSending crafted SIP packets (SQLi) ...');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        logger.bold(`\n... to ${ipAddress}`);
        if (report[ipAddress].auth) {
          const sipSqliCfg = {
            target: ipAddress,
            port: report[ipAddress].responses[0].port,
            transport: report[ipAddress].responses[0].transport,
            wsPath: report[ipAddress].responses[0].path || null,
            srcHost: report[ipAddress].responses[0].srcHost || null,
            srcPort: report[ipAddress].responses[0].srcPort || null,
            domain: report[ipAddress].responses[0].domain || null,
            timeout: options.timeout,
          };

          sipSqli.run(sipSqliCfg, (err, res) => {
            report[ipAddress].sqli = err || res;
            async1Cb();
          });
        } else {
          async1Cb();
        }
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      logger.bold('\nSending crafted SIP packets (SIP Torture) ...');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        logger.bold(`\n... to ${ipAddress}`);
        const sipTortureCfg = {
          target: ipAddress,
          port: report[ipAddress].responses[0].port,
          transport: report[ipAddress].responses[0].transport,
          wsPath: report[ipAddress].responses[0].path || null,
          srcHost: report[ipAddress].responses[0].srcHost || null,
          srcPort: report[ipAddress].responses[0].srcPort || null,
          domain: report[ipAddress].responses[0].domain || null,
          timeout: options.timeout,
        };

        sipTorture.run(sipTortureCfg, (err, res) => {
          report[ipAddress].sipTorture = err || res;
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      logger.bold('\nDenial of service (DoS) test ...');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        logger.bold(`\n... against ${ipAddress}`);
        sipDos.run({
          target: ipAddress,
          port: report[ipAddress].responses[0].port,
          transport: report[ipAddress].responses[0].transport,
          wsPath: report[ipAddress].responses[0].path || null,
          srcHost: report[ipAddress].responses[0].srcHost || null,
          srcPort: report[ipAddress].responses[0].srcPort || null,
          domain: report[ipAddress].responses[0].domain || null,
          numReq: profile.dosNumReq, // enough to see if the target is blocking us
          delay: profile.dosDelay,
          timeout: options.timeout,
        }, (err, res) => {
          if (res) {
            report[ipAddress].DoS = err || res;
          }
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      logger.bold('\nScanning another common services ...');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        logger.bold(`\n... in ${ipAddress}`);
        nmapScan.run({
          targets: ipAddress,
          ports: profile.commonPorts,
          binPath: options.nmapLocation,
        }, (err, res) => {
          if (res) {
            logger.json(res);
            report[ipAddress].nmap = err || res[0][0].ports;
          }
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      const finalTargets = [];

      logger.bold('\nSIP extension brute-force (CVE-2009-3727 / AST-2009-008) ...');

      // We're testing these three because the servers sometimes answer different to them
      lodash.each(profile.bruteExtTypes, meth => {
        lodash.each(Object.keys(report), ipAddress => {
          finalTargets.push({
            ipAddress,
            meth,
          });
        });
      });

      async.eachSeries(finalTargets, (finalPair, async1Cb) => {
        logger.bold(`\n... into ${finalPair.ipAddress} (${finalPair.meth})`);
        if (!report[finalPair.ipAddress].sipBruteExt404) {
          report[finalPair.ipAddress].sipBruteExt404 = {};
        }
        sipBruteExt404.run({
          target: finalPair.ipAddress,
          port: report[finalPair.ipAddress].responses[0].port,
          transport: report[finalPair.ipAddress].responses[0].transport,
          wsPath: report[finalPair.ipAddress].responses[0].path || null,
          extensions: blueTypes.userPass(profile.bruteExtensions),
          meth: finalPair.meth,
          srcHost: report[finalPair.ipAddress].responses[0].srcHost || null,
          srcPort: report[finalPair.ipAddress].responses[0].srcPort || null,
          domain: report[finalPair.ipAddress].responses[0].domain || null,
          delay: profile.bruteExtDelay,
          timeout: options.timeout,
        }, (err, res) => {
          report[finalPair.ipAddress].sipBruteExt404[finalPair.meth] = err || res;
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      const finalTargets = [];

      logger.bold('\nSIP extension brute-force (CVE-2011-2536 / AST-2011-011)) ...');

      // We're testing these three because the servers sometimes answer different to them
      lodash.each(profile.bruteExtTypes, meth => {
        lodash.each(Object.keys(report), ipAddress => {
          finalTargets.push({
            ipAddress,
            meth,
          });
        });
      });

      async.eachSeries(finalTargets, (finalPair, async1Cb) => {
        logger.bold(`\n... into ${finalPair.ipAddress} (${finalPair.meth})`);
        if (!report[finalPair.ipAddress].sipBruteExt100) {
          report[finalPair.ipAddress].sipBruteExt100 = {};
        }
        sipBruteExt100.run({
          target: finalPair.ipAddress,
          port: report[finalPair.ipAddress].responses[0].port,
          transport: report[finalPair.ipAddress].responses[0].transport,
          wsPath: report[finalPair.ipAddress].responses[0].path || null,
          extensions: blueTypes.userPass(profile.bruteExtensions),
          meth: finalPair.meth,
          srcHost: report[finalPair.ipAddress].responses[0].srcHost || null,
          srcPort: report[finalPair.ipAddress].responses[0].srcPort || null,
          domain: report[finalPair.ipAddress].responses[0].domain || null,
          delay: profile.bruteExtDelay,
          timeout: options.timeout,
        }, (err, res) => {
          report[finalPair.ipAddress].sipBruteExt100[finalPair.meth] = err || res;
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
    async0Cb => {
      logger.bold('\nSIP passwords brute-force ...');

      async.eachSeries(Object.keys(report), (ipAddress, async1Cb) => {
        let finalExtensions = [];

        // Looking if any valid extension was found in the last step
        lodash.each(profile.bruteExtTypes, type => {
          if (report[ipAddress].sipBruteExt404 &&
            report[ipAddress].sipBruteExt404[type] &&
            report[ipAddress].sipBruteExt404[type].valid) {
            lodash.each(report[ipAddress].sipBruteExt404[type].valid, extObj => {
              finalExtensions.push(extObj.extension);
            });
          }
        });
        lodash.each(profile.bruteExtTypes, type => {
          if (report[ipAddress].sipBruteExt100 &&
            report[ipAddress].sipBruteExt100[type] &&
            report[ipAddress].sipBruteExt100[type].valid) {
            lodash.each(report[ipAddress].sipBruteExt100[type].valid, extObj => {
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

        logger.bold(`\n... into ${ipAddress}`);
        report[ipAddress].sipBrutePass = {};
        sipBrutePass.run({
          target: ipAddress,
          port: report[ipAddress].responses[0].port,
          transport: report[ipAddress].responses[0].transport,
          wsPath: report[ipAddress].responses[0].path || null,
          extensions: finalExtensions,
          passwords: blueTypes.userPass(profile.brutePassPasses),
          userAsPass: profile.bruteUserAsPass,
          meth: 'REGISTER',
          srcHost: report[ipAddress].responses[0].srcHost || null,
          srcPort: report[ipAddress].responses[0].srcPort || null,
          domain: report[ipAddress].responses[0].domain || null,
          delay: profile.brutePassDelay,
          timeout: options.timeout,
        }, (err, res) => {
          report[ipAddress].sipBrutePass = err || res;
          async1Cb();
        });
      }, () => {
        async0Cb();
      });
    },
  ],
  // optional callback
  () => {
    const reportPath = `${options.reportPath}finalReport.json`;
    const reportPathHtml = `${options.reportPath}finalReport.html`;
    const templatePath = 'artifacts/reportTemplates/default.hbs';
    let reportHtml;
    let template;

    const templateFile = fs.readFileSync(path.resolve(__dirname, '../', templatePath), 'utf8');
    fs.writeFile(path.resolve(reportPath), JSON.stringify(report), err => {
      if (err) {
        logger.error(`\nWriting the final report (JSON): ${JSON.stringify(err)}`);
        callback(err);
      } else {
        logger.bold('\nThe final report (JSON) was written to the file:');
        logger.highlight(reportPath);
        logger.info('You can easily inspect it at: https://warfares.github.io/pretty-json/');

        // Creating the final HTML report
        template = hbs.compile(templateFile);
        reportHtml = template({
          report: JSON.stringify(report),
          date: moment().format('MMMM Do YYYY, h:mm:ss a'),
          profile: options.profile,
          version: PKG_INFO.version,
        });
        fs.writeFile(path.resolve(reportPathHtml), reportHtml, err2 => {
          if (err2) {
            logger.error(`\nWriting the final report (HTML): ${JSON.stringify(err2)}`);
            callback(err2);
          } else {
            logger.bold('\nThe final report (HTML) was written to the file:');
            logger.highlight(reportPathHtml);

            // opening the report
            shell.exec(
              `open ${reportPathHtml}`,
              {
                silent: true,
              },
              (code, output) => {
                if (code === 127) {
                  logger.error('ERROR: module/command not found');
                  logger.error(output);
                }
              }
            );
            callback(null, {
              report: reportPathHtml,
            });
          }
        });
      }
    });
  });
};
