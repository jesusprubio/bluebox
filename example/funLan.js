#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/


'use strict';

const util = require('util');

const Bluebox = require('../');
const utils = require('../lib/utils');

const box = new Bluebox();


box.events.on('info', (info) => {
  let toAdd = ':(';
  if (info.valid) { toAdd = ':)'; }

  /* eslint-disable no-console */
  console.log(`${info.pair[0]}  ${info.pair[1]}  ${toAdd}`);
});

console.log('Starting the mapping ...');
box.run('gather/network/map/tcp', {
  rhosts: '192.168.0.0/24',
  rports: [21, 22, 80, 443, 8080],
  concurrency: 1000,
})
.then((hosts) => {
  console.log('\nFound hosts', hosts);

  console.log('\nInspecting them ...');
  const exploreHost = host => new Promise((resolve) => {
    console.log(`\nExploring host: ${host.ip}: ${host.port} ...`);
    let service = 'http';
    if (host.port === 21) { service = 'ftp'; }
    if (host.port === 22) { service = 'ssh'; }

    console.log(`Possible ${service.toUpperCase()} server found, brute forcing it ...`);
    box.run(`gather/${service}/bruteCred`, {
      rhost: host.ip,
      rport: host.port,
      users: 'demo',
      passwords: 'file:top10',
    })
    .then((creds) => {
      console.log(`${service.toUpperCase()} brute done`);
      const tag = `${host.ip}:${host.port}`;

      if (creds.length > 0) {
        console.log(`creds found (${service.toUpperCase()})`, creds);
      }

      if (service !== 'http') {
        resolve();
        return;
      }

      const url = `http://${tag}`;
      console.log(`\nTaking a shoot of ${url} ...`);
      box.run('post/http/shoot', { url })
      .then((resShoot) => {
        console.log(`Shoot correctly taken, path: ${resShoot.path}`);
        resolve();
      })
      .catch((err) => {
        console.error('Error, taking the shoot', err);
        resolve();
      });
    })
    .catch((err) => {
      console.error('Error, brute forcing the hosts', err);
      resolve();
    });
  });

  utils.pMap(hosts, exploreHost, { concurrency: 5 })
  .then(() => {
    console.log('\nDone, result:');
    console.log(util.inspect(box.hosts, false, null));
  })
  .catch(err => console.error('Error, exploring the hosts', err));
})
.catch(err => console.error('Error, mapping the network:', err));
/* eslint-enable no-console */
