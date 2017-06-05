/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const clc = require('cli-color');
const prettyjson = require('prettyjson');
const emoji = require('node-emoji');
const keypress = require('keypress');

const utils = require('../../lib/utils');


/* eslint-disable no-console */
module.exports.regular = str => console.log(str);

module.exports.bold = str => console.log(clc.bold(str));

module.exports.info = str => console.log(clc.xterm(55)(str));

module.exports.infoHigh = str => console.log(clc.xterm(63)(str));

module.exports.result = str => console.log(clc.xterm(46)(str));

module.exports.json = json => console.log(prettyjson.render(json));

module.exports.error = (str, err) => {
  console.log(clc.red(str));
  if (err && err.stack) { console.log(clc.red(err.stack)); }
};

module.exports.title = str => console.log(clc.bold.xterm(202)(str));

module.exports.time = label => console.time(clc.xterm(63)(label));

module.exports.timeEnd = label => console.timeEnd(clc.xterm(63)(label));

module.exports.chunks = (arr, chunkSize, done) => {
  if (!utils.isArray(arr)) { throw new Error('Bad format, array needed'); }

  const chunks = utils.chunk(arr, chunkSize);
  let index = 0;
  const eventName = 'keypress';

  // Make `process.stdin` begin emitting "keypress" events.
  keypress(process.stdin);


  console.log(prettyjson.render(chunks[index]));
  index += 1;
  if (!chunks[index]) {
    done();
    return;
  }

  console.log(clc.xterm(63)('\nPress ESC to finish or any other key to see more ...'));
  process.stdin.on(eventName, (ch, key) => {
    // To allow ctrl+c.
    if (key.ctrl && key.name === 'c') {
      process.stdin.pause();
    }

    if ((key.name && (key.name === 'c' || key.name === 'escape')) ||
        !chunks[index]) {
      process.stdin.removeAllListeners(eventName);
      done();
      return;
    }

    console.log(prettyjson.render(chunks[index]));
    index += 1;
  });

  if (process.stdin) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }
};

/* eslint-enable no-console */

module.exports.emoji = label => emoji.get(label);

module.exports.moveUp = () => {
  process.stdout.write(clc.move.up(1));
  process.stdout.write(clc.erase.line);
};

module.exports.clear = () => process.stdout.write(clc.reset);
