/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio Garcia <s3rgio.gr gmail com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const utils = require('../utils');
const dorksJson = require('../../artifacts/voipDorks');


module.exports.description = 'Find potential VoIP targets using a Google dork';


module.exports.run = () => utils.Promise.resolve(dorksJson);
