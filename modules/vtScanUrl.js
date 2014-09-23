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
            name        : 'vtScanUrl',
            description : 'Virustotal URL Scanner',
            options : {
                target : {
                    description  : 'URL to scan',
                    defaultValue : 'http://example.org',
                    type         : 'anyValue'
                }
            }
        },

        run: function (options, callback) {
            virustotal.setKey(options.virustotalKey);
            virustotal.scanUrl(options.target, function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log(res.resource);

                virustotal.getUrlReport(
                    res.resource,
                    callback
                );
            });

        }
    };

}();