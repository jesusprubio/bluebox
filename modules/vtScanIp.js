/*
 Copyright Sergio Garcia <s3rgio.gr gmail com>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var virustotal = require('virustotal.js');

module.exports = function () {

    return {

        info: {
            name        : 'vtScanIp',
            description : 'Virustotal IP Scanner',
            options     : {
                target : {
                    description  : 'IP address to scan',
                    defaultValue : '8.8.8.8',
                    type         : 'targetIp'
                }
            }
        },

        run: function (options, callback) {
            virustotal.setKey(options.virustotalKey);
            virustotal.getIpReport(
                options.target,
                callback
            );
        }

    };

}();
