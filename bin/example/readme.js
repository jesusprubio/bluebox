#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

/* eslint-disable no-console */

'use strict';

const BlueboxCli = require('../../').Cli;
// const BlueboxCli = require('bluebox-ng').Cli;

const cli = new BlueboxCli();
const moduleOptions = { target: '8.8.8.8' };


console.log('Modules info:');
console.log(JSON.stringify(cli.help(), null, 2));

cli.run('geolocation', moduleOptions)
.then((res) => {
  console.log('Result:');
  console.log(res);
})
.catch((err) => {
  console.log('Error:');
  console.log(err);
});
