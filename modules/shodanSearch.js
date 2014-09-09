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

var ShodanClient = require('shodan-client');


module.exports = (function () {

    return {

        info : {
            name        : 'shodanSearch',
            description : 'Find potential targets in SHODAN computer search engine',
            options     : {
                query : {
                    description  : 'Query to search about, could include port, country, product, etc.',
                    defaultValue : 'openssh',
                    type         : 'anyValue'
                },
                pages : {
                    description  : 'Number of pages (of results) to return (only 1 allowed with free accounts)',
                    defaultValue : 1,
                    type         : 'positiveInt'
                },
                timeout : {
                    description  : 'Time to wait for a response, in ms.',
                    defaultValue : 15000,
                    type         : 'positiveInt'
                }
            }
        },

        run : function (options, callback) {
            var reqOptions  = {
                    key     : options.shodanKey,
                    timeout : parseInt(options.timeout),
                },
                shodanClient = new ShodanClient(reqOptions),
                searchOptions = {
                    query  : options.query,
    //                facets : 'port:100',
                    page    : parseInt(options.pages)
                };

            if (options.shodanKey) {
                shodanClient.search(searchOptions, callback);
            }
            else {
                callback({
                    type : 'A SHODAN key is needed to run this module.'
                });
            }
        }
    };

}());
