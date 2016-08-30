// Copyright Sergio Garca <s3rgio.gr gmail com>
//           Aan Wahyu <cacaddv gmail com>
//           Jesus Perez <jesusprubio gmail com>
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


const utils = require('../utils');

const Promise = utils.Promise;
const protocols = utils.requireDir(module, '../protocols');

// TODO: Keep an eye and use a secure value here.
// TODO: Take from cfg file.
const concurrency = 100;


module.exports.description = 'SSH credentials brute force';

module.exports.options = {
  protocol: {
    type: 'bruteProto',
    description: 'Protocol to use',
    defaultValue: 'ssh',
  },
  target: {
    type: 'ip',
    description: 'Host to attack',
    // TODO: REMOVE
    defaultValue: '127.0.0.1',
  },
  port: {
    type: 'port',
    description: 'Port to attack on chosen IPs',
    defaultValue: 22,
  },
  users: {
    type: 'userPass',
    description: 'Users, range (ie: range:0000-0100) or file ' +
                 '(ie: file:../artifacts/dics/john.txt) with them to test',
    defaultValue: 'range:0000-0100',
  },
  passwords: {
    type: 'userPass',
    description: 'Password (or file with them) to test',
    defaultValue: 'range:0000-0100',
  },
  userAsPass: {
    type: 'yesNo',
    description: 'Test the same user as password for each one.',
    defaultValue: 'yes',
  },
  delay: {
    type: 'positiveInt',
    description: 'Delay between requests, in ms.',
    // TODO: FIXX
    // defaultValue: 0,
    defaultValue: 10,
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    defaultValue: 5000,
  },
};


function filter(arr) {
  const filtered = utils.filter(arr, entry => {
    if (!entry) { return false; }

    return true;
  });

  return filtered;
}


module.exports.run = opts =>
  new Promise((resolve, reject) => {
    // Adding the usernames as passwords if required.
    let finalPasswords = opts.passwords;
    if (opts.userAsPass) { finalPasswords = utils.concat(finalPasswords, opts.users); }

    // We need an iterable to avoid a full break with huge ones (GC).
    const credPairs = new utils.ProductIterable(opts.users, finalPasswords);

    // Adding a delay between requests (if needed).
    // if (opts.delay) {
    //   // TODO!
    //   // hit = hit.delay(opts.delay);
    //   // Mandatory when we have a delay.
    //   concurrency = 1;
    // }

    // Running a promise which resolves to an array with all the results.
    Promise.map(
      credPairs,
      (credPair) => {
        const finalOpts = opts;
        finalOpts.credPair = credPair;

        // TODO: REMOVEE
        finalOpts.protocol = 'ssh';
        return protocols[opts.protocol](finalOpts);
      },
      { concurrency }
    )
    .then(res => resolve(filter(res)))
    // TODO: Needed?
    .catch(err => reject(err));
  });
