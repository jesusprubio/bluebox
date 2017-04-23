#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/


'use strict';

const Bluebox = require('../');

const box = new Bluebox();


box.events.on('info', (info) => {
  /* eslint-disable no-console */
  console.log('Event with extra info:');
  console.log(info);
});

// box.run('gather/network/map/ping', { rhosts: '192.168.0.0/24' })
box.run('gather/network/map/ping', { rhosts: '192.168.0.1-10' })
.then((res) => {
  console.log('Result:');
  console.log(res);
})
.catch((err) => {
  console.log('Error:');
  console.log(err);
  /* eslint-enable no-console */
});

