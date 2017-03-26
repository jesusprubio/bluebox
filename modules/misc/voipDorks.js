/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const utils = require('../../lib/utils');

const dorksJson = require('../../artifacts/voipDorks');


module.exports.desc = 'Find potential VoIP targets using a Google dork.';


// TODO: Allow Make the request and parse the response
// -> generic module for dorks (add it also in the library)
module.exports.impl = () => utils.Promise.resolve(dorksJson);
