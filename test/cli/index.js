/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const test = require('tap').test; // eslint-disable-line import/no-extraneous-dependencies
const lodash = require('lodash');

const utils = require('../../bin/lib');
const Cli = require('../../bin/Cli');
const pkgInfo = require('../../package.json');
const errMsgs = require('../../bin/cfg/errorMsgs');


const cli = new Cli();


test('method "version"', (assert) => {
  assert.plan(1);

  assert.deepEqual(cli.version, pkgInfo.version);
});


test('method "help"', (assert) => {
  assert.plan(1);

  const expectedRes = lodash.extend(
    utils.requireDir(module, '../../bin/lib/modules'),
    utils.requireDir(module, '../../bin/lib/modules/private')
  );

  assert.deepEqual(cli.help(), expectedRes);
});


test('method "run"', (assert) => {
  assert.plan(2);

  cli.run('geolocation', { rhost: '8.8.8.8' })
  .then((res) => {
    assert.equal(res.country_code, 'US');
    assert.equal(res.country_name, 'United States');
  });
});


test('method "run" with invalid module', (assert) => {
  assert.plan(1);

  cli.run('a', {})
  // Needed to be sure it's going through the expected path.
  .then(() => assert.fail('Should fail.'))
  .catch(err => assert.equal(err.message, errMsgs.index.notFound));
});


test('method "run" with invalid param', (assert) => {
  assert.plan(1);

  const expectedErr = `${errMsgs.index.parseOpts} : "target" : ${errMsgs.types.ip}`;

  cli.run('geolocation', { rhost: 'a' })
  // Needed to be sure it's going through the expected path.
  .then(() => assert.fail('Should fail.'))
  .catch(err => assert.equal(err.message, expectedErr));
});


// TODO: Uncomment when the module is working.
// test('method "run" (Shodan command without key)', (assert) => {
//  assert.plan(1);
//   const opts = { rhost: '8.8.8.8' };
//   const expectedErr = 'A SHODAN key is needed to run this module ' +
//     '(https://account.shodan.io/register)';
//
//   cli.run('shodanHost', opts)
//   .then(() => assert.fail('Should fail.'))
//   .catch(err => assert.equal(err.message, expectedErr));
// });
// test(`"${fileName}" method "run" (Shodan command without key)`, (assert) => {
