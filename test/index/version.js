/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const wushu = require('../..');
const pkgInfo = require('../../package.json');


test('without parameters', (assert) => {
  assert.plan(1);

  assert.deepEqual(wushu.version(), pkgInfo.version);
});
