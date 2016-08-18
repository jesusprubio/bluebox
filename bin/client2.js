#!/usr/bin/env node

// Copyright Jesus Perez <jesusprubio gmail com>
//           Antonio Carrasco <ancahy2600 gmail com>
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

'use strict';

const vorpal = require('vorpal')();

vorpal
  .command('say [words...]')
  .option('-b, --backwards')
  .option('-t, --twice')
  .action((args) =>
    new Promise((resolve, reject) => {
      let str = args.words.join(' ');

      str = (args.options.backwards) ?
        str.split('').reverse().join('') :
        str;

      console.log(str);
      resolve();
    })
  );

vorpal.show();
