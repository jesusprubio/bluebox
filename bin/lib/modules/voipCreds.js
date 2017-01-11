/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const utils = require('../utils');
const credsJson = require('../../artifacts/voipCreds');


module.exports.description = 'Show common VoIP system default credentials';


module.exports.run = () => utils.Promise.resolve(credsJson);
