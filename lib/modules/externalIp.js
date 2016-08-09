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


const moira = require('moira');

module.exports.help = {
  description: 'Get your external IP address (icanhazip.com)',
  options: null,
};


module.exports.run = (options, callback) => {
  moira.getIP((err, ip, service) => {
    if (err) {
      callback(err);

      return;
    }
    callback(null, {
      ip,
      service,
    });
  });
};
