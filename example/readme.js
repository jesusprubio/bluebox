#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

/* eslint-disable no-console */

'use strict';

const Bluebox = require('../');
// const Bluebox = require('bluebox-ng');

const box = new Bluebox();


console.log('Modules info:');
console.log(JSON.stringify(box.help(), null, 2));

box.run('geolocation', { rhost: '8.8.8.8' })
.then((res) => {
  console.log('Result:');
  console.log(res);
})
.catch((err) => {
  console.log('Error:');
  console.log(err);
});
