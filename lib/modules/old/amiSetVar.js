// Copyright Jesus Perez <jesusprubio gmail com>
//           Sergio Garcia <s3rgio.gr gmail com>
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


const namiLib = require('nami');

const Nami = namiLib.Nami;

module.exports.help = {
  description: 'Use the Asterisk Manager service (AMI) to set the value of a setup variable',
  options: {
    target: {
      type: 'ip',
      description: 'IP address to brute-force',
      defaultValue: '127.0.0.1',
    },
    port: {
      type: 'port',
      description: 'Port of the server',
      defaultValue: 5038,
    },
    user: {
      type: 'allValid',
      description: 'User to use in the request',
      defaultValue: 'admin',
    },
    password: {
      type: 'allValid',
      description: 'Password to use in the request',
      defaultValue: 'amp111',
    },
    channel: {
      type: 'allValid',
      description: 'Channel to use in the request',
      defaultValue: 'SIP/100@default',
    },
    value: {
      type: 'allValid',
      description: 'New value to set',
      defaultValue: 'newValue',
    },
    variable: {
      type: 'allValid',
      description: 'Name of the variable to get',
      defaultValue: 'extension',
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response (ms.)',
      defaultValue: 5000,
    },
  },
};


module.exports.run = (options, callback) => {
  let connected = false;
  const ami = new Nami({
    host: options.target,
    port: options.port,
    username: options.user,
    secret: options.password,
  });

  ami.logger.setLevel('OFF');

  ami.on('namiConnected', () => {
    const action = new namiLib.Actions.SetVar();

    action.channel = options.channel;
    action.variable = options.variable;
    connected = true;
    ami.send(action, res => {
      ami.close();
      callback(null, res);
    });
  });

  ami.on('namiLoginIncorrect', () => {
    callback({
      type: 'login',
    });
  });

  // The module does not support connection timeout, so
  // we add it manually ("connected" var), really dirty trick
  setTimeout(() => {
    if (!connected) {
      callback({
        type: 'timeout',
      });
    }
  }, options.timeout);
  ami.open();
};
