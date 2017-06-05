/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

const utils = require('../../lib/utils');

const optsB = require('./base');
const optsC = require('./concurrent');

const opts = {};
utils.defaultsDeep(opts, optsB, optsC);
delete opts.rhost;
delete opts.rport;


opts.rhosts = {
  types: 'ips',
  desc: 'Host to inspect (IP), range (ie: "192.168.0.1-256") ' +
        'of a file with them (file:./whatever/galicianIps.txt)',
  default: '192.168.0.0/24',
};

opts.rports = {
  types: 'ports',
  desc: 'Port (or multiple sepatared with commas), or range (22-8080)',
  default: [80, 443, 8008, 8080],
};


module.exports = opts;
