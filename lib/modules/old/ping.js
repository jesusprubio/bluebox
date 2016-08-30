// Copyright Jesus Perez <jesusprubio gmail com>
//           Sergio Garcia <s3rgio.gr gmail com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';


const ping = require('ping');

module.exports.help = {
  description: 'Ping protocol client',
  options: {
    target: {
      type: 'ip',
      description: 'Host to explore',
      defaultValue: '8.8.8.8',
    },
    // timeout: {
    //    type: 'positiveInt',
    //    description: 'Time to wait for a response (s)',
    //    defaultValue: 5,
    // },
    interval: {
      type: 'float',
      description: 'Time to wait between (s)',
      defaultValue: '0.5',
    },
  },
};


module.exports.run = (options, callback) => {
  // Not working
  // ping.promise.probe(
  //    options.target,
  //    {
  //        timeout: options.timeout,
  //        extra: [
  //            '-i ' + options.interval
  //        ]
  //    }
  // ).then(function (res) {
  //    callback(null, res);
  // })
  // .done();
  ping.sys.probe(options.target, alive => {
    callback(null, {
      alive,
    });
  });
};
