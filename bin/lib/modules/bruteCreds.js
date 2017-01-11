/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>
            Aan Wahyu <cacaddv gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const brute = require('../../..').bruteCreds;


module.exports.description = 'Different protocols credentials brute force';

module.exports.options = {
  protocol: {
    type: 'bruteProto',
    description: 'Protocol to use',
    defaultValue: 'ssh',
  },
  target: {
    type: 'ip',
    description: 'Host to attack',
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
    description: 'Delay between batches of requests (depending of the "concurrency"), in ms.',
    // TODO: FIXX
    // defaultValue: 0,
    defaultValue: 10,
  },
  concurrency: {
    type: 'positiveInt',
    description: 'Number of requests to do at the same time. Only works if "delay" is not 0',
    defaultValue: 100,
  },
  timeout: {
    type: 'positiveInt',
    description: 'Time to wait for a response, in ms.',
    defaultValue: 5000,
  },
};


module.exports.run = opts => brute(opts.target, opts);
