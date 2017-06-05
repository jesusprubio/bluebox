/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const dorks = require('../../artifacts/voipDorks');


module.exports.desc = 'Find potential VoIP targets using a Google dork.';


// TODO: Allow Make the request and parse the response
// -> generic module for dorks (add it also in the library)
module.exports.impl = () => Promise.resolve(dorks);
