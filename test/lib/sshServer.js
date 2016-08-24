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

// SSH server tests helper.

const fs = require('fs');
const path = require('path');

const ssh = require('ssh2');

const utils = require('../../lib/utils/utils');

// Mandatory to start the server.
const key = fs.readFileSync(path.resolve(__dirname, '../artifacts/keys/key'));


class Server {

  constructor(cfg) {
    this.cfg = cfg;

    this.server = new ssh.Server(
      { hostKeys: [key] },
      (client) => {
        client.on('authentication', ctx => {
          if (ctx.method === 'password' &&
          ctx.username === cfg.userName && ctx.password === cfg.password) {
            ctx.accept();
          } else {
            ctx.reject();
          }
        });
      }
    );
  }

  start() {
    return new utils.Promise(resolve => this.server.listen(this.cfg.port, this.cfg.ip, resolve));
  }

  stop() { return new utils.Promise(resolve => this.server.close(resolve)); }
}


module.exports = Server;
