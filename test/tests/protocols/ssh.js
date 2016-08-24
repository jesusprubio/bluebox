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

const pathToName = require('../../../lib/utils/utils').pathToName;
const method = require('../../../lib/protocols/ssh');
const Server = require('../../lib/sshServer');

const fileName = pathToName(__filename);
const serverCfg = {
  ip: '127.0.0.1',
  port: 1337,
  userName: 'foo',
  password: 'bar',
};
const clientCfg = {
  target: serverCfg.ip,
  port: serverCfg.port,
  // We're in local environment, should be fast.
  timeout: 1000,
};
// Starting an SSH server to test the module.
const server = new Server(serverCfg);


server.start()
.then(() => {
  /* We need the server ready before starting the tests. */

  test(`"${fileName}" protocol should get response for valid credentials`, assert => {
    clientCfg.credPair = [serverCfg.userName, serverCfg.password];

    return method(clientCfg).then(res => { assert.deepEqual(res, clientCfg.credPair); });
  });


  test(`"${fileName}" protocol should get null for invalid username`, assert => {
    clientCfg.credPair = [serverCfg.userName, 'kase'];

    return method(clientCfg).then(res => { assert.equal(res, null); });
  });


  test(`"${fileName}" protocol should get null for invalid password`, assert => {
    clientCfg.credPair = ['ola', serverCfg.password];

    return method(clientCfg).then(res => { assert.equal(res, null); });
  });


  test(`"${fileName}" protocol should get null for invalid both credentials`, assert => {
    clientCfg.credPair = ['ola', 'kase'];

    return method(clientCfg).then(res => { assert.equal(res, null); });
  });


  test(`"${fileName}" protocol should fail for another error`, assert => {
    clientCfg.credPair = [serverCfg.userName, serverCfg.password];
    clientCfg.port = 9999;
    const expectedErr = `connect ECONNREFUSED ${clientCfg.target}:${clientCfg.port}`;

    return method(clientCfg)
    .then(() => assert.fail('Should fail.'))
    .catch(err => { assert.equal(err.message, expectedErr); server.stop(); });
  });
});
