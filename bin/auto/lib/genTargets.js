/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const utils = require('../../../lib/utils');


module.exports = (rhost, customServices, sipTypes, wsPath) => {
  const targets = [];
  const wsPaths = ['', wsPath];

  // Getting all combinations
  // TODO: Refactor this. BTW the array it's small, we don't have memory problems here.
  utils.each(customServices, (sipPair) => {
    // All requeqs which the server could answer at
    utils.each(sipTypes, (meth) => {
      if (sipPair[1] === 'WS' || sipPair[1] === 'WSS') {
        utils.each(wsPaths, (wPath) => {
          targets.push({
            ip: rhost,
            port: sipPair[0],
            transport: sipPair[1],
            meth,
            wPath,
          });
        });

        return;
      }

      targets.push({
        ip: rhost,
        port: sipPair[0],
        transport: sipPair[1],
        meth,
      });
    });
  });

  return targets;
};
