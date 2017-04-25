// #!/usr/bin/env node

// /*
//   Copyright Jesús Pérez <jesusprubio@gmail.com>
//             Sergio García <s3rgio.gr@gmail.com>

//   This code may only be used under the MIT license found at
//   https://opensource.org/licenses/MIT.
// */

// // Auto VoIP pentesting.

// 'use strict';

// const util = require('util');

// const Bluebox = require('../');
// const utils = require('../../lib/utils');
// const optsMap = require('../../cfg/commonOpts/map');
// const optsSip = require('../../cfg/commonOpts/sip');
// const parseOpts = require('../../lib/parseOpts');
// const errMsgs = require('../../cfg/errorMsgs').index;

// const dbg = utils.dbg(__filename);
// let box;

// // Reusing the library parsing.
// const optsComm = {};
// utils.defaultsDeep(optsComm, optsMap, optsSip);
// delete optsComm.rports;
// delete optsComm.meth;
// delete optsComm.concurrency;

// optsComm.profile = {
//   desc: 'Type of scanning (quick, regular, aggressive, paranoid) or custom file (file:...)',
//   default: 'regular',
//   // default: 'debug'
// };
// optsComm.reportPath = {
//   desc: 'File to store the final report',
//   default: '.',
// };
// optsComm.keyS = { desc: 'SHODAN API key' };


// // Informational events, ie: for mapping and brute force partial results.
// box.events.on('info', (info) => {
//   let toAdd = ':(';
//   if (info.valid) { toAdd = ':)'; }

//   /* eslint-disable no-console */
//   console.log(`${info.pair[0]}  ${info.pair[1]}  ${toAdd}`);
// });


// module.exports = (rhosts, optsPassed = {}) => new Promise((resolve, reject) => {
//   box = new Bluebox();

//   // Parsing the paremeters.
//   let opts;
//   try {
//     opts = parseOpts(optsPassed, optsComm);
//   } catch (err) {
//     reject(new Error(`${errMsgs.parseOpts} : ${err.message}`));
//     return;
//   }


//   console.log('Starting the mapping ...');
//   box.run('gather/network/map/tcp', {
//     rhosts: '192.168.0.0/24',
//     rports: [21, 22, 80, 443, 8080],
//     concurrency: 1000,
//   })
//   .then((hosts) => {
//     console.log('\nFound hosts', hosts);

//     console.log('\nInspecting them ...');
//     const exploreHost = host => new Promise((resHost) => {
//       console.log(`\nExploring host: ${host.ip}: ${host.port} ...`);
//       let service = 'http';
//       if (host.port === 21) { service = 'ftp'; }
//       if (host.port === 22) { service = 'ssh'; }

//       console.log(`Possible ${service.toUpperCase()} server found, brute forcing it ...`);
//       box.run(`gather/${service}/bruteCred`, {
//         rhost: host.ip,
//         rport: host.port,
//         users: 'demo',
//         passwords: 'file:top10',
//       })
//       .then((creds) => {
//         console.log(`${service.toUpperCase()} brute done`);
//         const tag = `${host.ip}:${host.port}`;

//         if (creds.length > 0) {
//           console.log(`creds found (${service.toUpperCase()})`, creds);
//         }

//         if (service !== 'http') {
//           resHost();
//           return;
//         }

//         const url = `http://${tag}`;
//         console.log(`\nTaking a shoot of ${url} ...`);
//         box.run('post/http/shoot', { url })
//         .then((resShoot) => {
//           console.log(`Shoot correctly taken, path: ${resShoot.path}`);
//           resHost();
//         })
//         .catch((err) => {
//           console.error('Error, taking the shoot', err);
//           resHost();
//         });
//       })
//       .catch((err) => {
//         console.error('Error, brute forcing the hosts', err);
//         resolve();
//       });
//     });

//     utils.pMap(hosts, exploreHost, { concurrency: 5 })
//     .then(() => {
//       console.log('\nDone, result:');
//       console.log(util.inspect(box.hosts, false, null));
//     })
//     .catch(err => console.error('Error, exploring the hosts', err));
//   })
//   .catch(err => console.error('Error, mapping the network:', err));
// });


// // module.exports.desc = 'Automated VoIP pentesting.';


// // module.exports.opts = optsComm;


// // function genTargets(ips, customServices, sipTypes) {
// //   const targets = [];

// //   // Getting all combinations
// //   // TODO: Refactor this. BTW the array it's small, we don't have memory problems here.
// //   utils.each(ips, (target) => {
// //     utils.each(customServices, (sipService) => {
// //       // All requeqs which the server could answer at
// //       utils.each(sipTypes, (meth) => {
// //         if (sipService.transport === 'WS' || sipService.transport === 'WSS') {
// //           utils.each(['', 'ws'], (wsPath) => {
// //             targets.push({
// //               ip: target,
// //               port: sipService.port,
// //               transport: sipService.transport,
// //               meth,
// //               wsPath,
// //             });
// //           });

// //           return;
// //         }

// //         targets.push({
// //           ip: target,
// //           port: sipService.port,
// //           transport: sipService.transport,
// //           meth,
// //         });
// //       });
// //     });
// //   });

// //   return targets;
// // }


// // module.exports.impl = (opts = {}) => new Promise((resolve, reject) => {
// // // finalReport: Object of Objects (hosts)
// //   const report = {};
// //   const initTargets = [];

// //   function mapSip(target) {
// //       var sipScanCfg = {
// //               targets: [finalTarget.ip],
// //               ports: [finalTarget.port],
// //               transport: finalTarget.transport,
// //               wsPath: finalTarget.wsPath || null,
// //               meth: finalTarget.meth,
// //               srcHost: options.srcHost || null,
// //               srcPort: options.srcPort || null,
// //               domain: options.domain || null,
// //               delay: 0, // Not used, we're doing one scan per target
// //               timeout: options.timeout
// //           };

// //       sipScan.run(sipScanCfg, function (err, res) {
// //           // We only want online servers which anser our requests
// //           if (!err && res && res.length !== 0) {
// //               // This host still wasn't included in the report
// //               // TODO: Check that all transports/ports answer with the same agent
// //               if (!report[finalTarget.ip]) {
// //                   report[finalTarget.ip] = {
// //                       service: res[0].service,
// //                       version: res[0].version,
// //                       auth: res[0].auth,
// //                       responses: []
// //                   };
// //               }

// //               delete res[0].host;

// //               report[finalTarget.ip].responses.push(res[0]);
// //           }
// //           asyncCallback();
// //       });
// //   }

// //   // Getting the profile
// //   // TODO: Errors management
// //   profile = require('../artifacts/profiles/' + options.profile + '.json');
// //   printer.bold('Using "' + options.profile + '" profile:');
// //   printer.json(profile);

// // });
