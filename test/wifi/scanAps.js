/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies

const method = require('../../lib/wifi/scanAps');
const utils = require('../../lib/utils');


test('without parameters', (assert) => {
  assert.plan(2);

  method()
  .then((res) => {
    // To confirm that the response is an array.
    assert.type(res.length, 'number');
    if (res.length > 0) {
      assert.deepEqual(utils.keys(res[0]), ['mac', 'ssid', 'channel', 'signal_level', 'security']);
    } else {
      // To reach the planned two if any wifi (or iface) no present.
      assert.ok(true);
    }
  });
});
