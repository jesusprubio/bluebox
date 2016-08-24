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

const utils = require('../../../lib/utils/utils');
const method = require('../../../lib/modules/bruteCreds.js');
const Server = require('../../lib/sshServer');

const serverCfg = {
  ip: '127.0.0.1',
  port: 1337,
  userName: 'foo',
  password: 'bar',
};
// Starting an SSH server to test the module.
const server = new Server(serverCfg);
const opts = {
  target: serverCfg.ip,
  port: serverCfg.port,
  users: [serverCfg.userName],
  userAsPass: false,
  timeout: 1000,
};


server.start()
.then(() => {
  test('should get a response for single valid credential', assert => {
    opts.passwords = [serverCfg.password];

    return method.run(opts)
    .then(res => assert.deepEqual(res, [[serverCfg.userName, serverCfg.password]]));
  });


  test('should get empty response for single invalid credential', assert => {
    opts.passwords = ['ola'];

    return method.run(opts)
    .then(res => assert.deepEqual(res, []));
  });


  test('should get a response for multiple valid and invalid credentials', assert => {
    opts.passwords = ['ola', 'bar'];

    return method.run(opts)
    .then(res => {
      server.stop();

      assert.deepEqual(res, [[serverCfg.userName, serverCfg.password]]);
      server.stop();
    });
  });
});


// Starting an SSH server with different setup.
// We can do it in parallel.

const serverCfg2 = utils.cloneDeep(serverCfg);
serverCfg2.port = 1338;
serverCfg2.password = 'foo';

const server2 = new Server(serverCfg2);
server2.start()
.then(() => {
  test('should get a response for non valid credentials but "userAsPass" is valid', assert => {
    // Any non valid is ok here.
    opts.port = serverCfg2.port;
    opts.passwords = ['ola'];
    opts.userAsPass = true;

    return method.run(opts)
    .then(res => {
      server2.stop();

      assert.deepEqual(res, [[serverCfg2.userName, serverCfg2.password]]);
    });
  });
});
