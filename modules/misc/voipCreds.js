/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const utils = require('../../lib/utils');
const creds = require('../../artifacts/voipCreds');


module.exports.desc = 'Show common VoIP system default credentials.';


module.exports = () => utils.Promise.resolve(creds);
