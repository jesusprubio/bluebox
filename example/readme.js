#!/usr/bin/env node

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

/* eslint-disable no-console */

'use strict';

const Bluebox = require('../');
// const Bluebox = require('bluebox-ng');

// TODO: Check without passing {}
const bluebox = new Bluebox({});
const moduleOptions = { target: '8.8.8.8' };


console.log('Modules info:');
console.log(JSON.stringify(bluebox.help(), null, 2));

bluebox.run('geolocation', moduleOptions)
.then(res => {
  console.log('Result:');
  console.log(res);
})
.catch(err => {
  console.log('Error:');
  console.log(err);
});
