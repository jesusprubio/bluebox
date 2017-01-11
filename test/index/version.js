/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const wushu = require('../..');
const pkgInfo = require('../../package.json');


test('without parameters', (assert) => {
  assert.plan(1);

  assert.deepEqual(wushu.version(), pkgInfo.version);
});
