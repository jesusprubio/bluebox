/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


// const utils = require('../../../lib/utils');
const logger = require('../../utils/logger');

// const dbg = utils.dbg(__filename);


module.exports = (box, host, port) => new Promise((resolve) => {
  logger.info(`\nExploring host: ${host}: ${port} ...`);
  resolve();
  // console.log(`Possible ${service.toUpperCase()} server found, brute forcing it ...`);
  // box.run(`gather/${service}/bruteCred`, {
  //   rhost: host,
  //   rport: port,
  //   users: 'demo',
  //   passwords: 'file:top10',
  // })

  // let service = 'http';
  // if (host.port === 21) { service = 'ftp'; }
  // if (host.port === 22) { service = 'ssh'; }

  // console.log(`Possible ${service.toUpperCase()} server found, brute forcing it ...`);
  // box.run(`gather/${service}/bruteCred`, {
  //   rhost: host,
  //   rport: port,
  //   users: 'demo',
  //   passwords: 'file:top10',
  // })
  // .then((creds) => {
  //   console.log(`${service.toUpperCase()} brute done`);
  //   const tag = `${host.ip}:${host.port}`;

  //   if (creds.length > 0) {
  //     console.log(`creds found (${service.toUpperCase()})`, creds);
  //   }

  //   if (service !== 'http') {
  //     resolve();
  //     return;
  //   }

  //   const url = `http://${tag}`;
  //   console.log(`\nTaking a shoot of ${url} ...`);
  //   box.run('post/http/shoot', { url })
  //   .then((resShoot) => {
  //     logger.info(`Shoot correctly taken, path: ${resShoot.path}`);
  //     resolve();
  //   })
  //   .catch((err) => {
  //     logger.error('Error, taking the shoot', err);
  //     resolve();
  //   });
  // })
  // .catch((err) => {
  //   logger.error(`Brute forcing the host ${JSON.stringify({ host, port })}`, err);
  //   resolve();
  // });
});

