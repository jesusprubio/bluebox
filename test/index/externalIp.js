/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
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
