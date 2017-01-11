/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/index/externalIp');
const utils = require('../../lib/utils');


test('without parameters', (assert) => {
  assert.plan(1);

  method()
  .then(res => assert.ok(utils.validator.isIP(res)));
});
