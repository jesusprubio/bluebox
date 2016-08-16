// Copyright Jesus Perez <jesusprubio gmail com>
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

const test = require('tap').test;

const method = require('../../lib/utils/common').pathToName;
const errorMsgs = require('../../lib/utils/errorMsgs').pathToName;


/* We can use this function here to get the name of this file
because we're testing it. */
test('"pathToName" with a valid file name', assert => {
  assert.plan(1);
  assert.equal('index', method('./a/b/c/index.js'));
});


test('"pathToName" with an invalid file name', {}, assert => {
  const expectedErr = new RegExp(errorMsgs.badPath);

  assert.plan(1);
  assert.throws(() => { method('a'); }, expectedErr);
});
