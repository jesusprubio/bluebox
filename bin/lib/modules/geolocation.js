/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';

const geo = require('../../..').geo;


module.exports.description = 'Geolocate a host (freegeoip.net)';


module.exports.options = {
  target: {
    type: 'ip',
    description: 'Host to explore',
    defaultValue: '8.8.8.8',
  },
};


module.exports.run = opts => geo(opts.target);
