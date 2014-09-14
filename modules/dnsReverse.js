/*
Copyright Jesus Perez <jesusprubio gmail com>

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

var dns    = require('dns'),
    async  = require('async');


module.exports = (function () {

    return {

        info : {
            name        : 'dnsReverse',
            description : 'DNS inverse resolution of an IP address',
            options     : {
                target : {
                    description  : 'Target IP to explore',
                    defaultValue : '8.8.8.8',
                    type         : 'targetIp'
                }
            }
        },

        run : function (options, callback) {
            var finalDomain = null;

            dns.reverse(options.target, function (err, domains) {
                if(err) {
                    callback(err);
                } else {
                    async.eachSeries(domains, function (domain, asyncCb) {
                        if (!finalDomain) {
                            dns.lookup(domain,function (err, address, family) {
                                if (!err && (options.target === address)) {
                                    finalDomain = domain;
                                }
                                asyncCb();
                            });
                        } else {
                            asyncCb();
                        }
                    }, function (err) {
                        callback(null, {
                            domain : finalDomain
                        });
                    });
                }
            });
        }
    };

}());
