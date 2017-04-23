#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

/* eslint-disable no-console */

'use strict';

const Bluebox = require('../');

const box = new Bluebox();


box.run('gather/network/geo', { rhost: '8.8.8.8' })
.then((res) => {
  /* eslint-disable no-console */
  console.log('Result:');
  console.log(res);
})
.catch((err) => {
  console.log('Error:');
  console.log(err);
  /* eslint-enable no-console */
});
