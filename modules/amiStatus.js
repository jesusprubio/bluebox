/*
Copyright Jesus Perez <jesusprubio gmail com>
          Sergio García <s3rgio.gr gmail com>

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

// Private stuff

var async   = require('async'),
    namiLib = require('nami'),
    Nami    = namiLib.Nami,

    printer = require('../utils/printer'),  

    HELP = {
        description : 'Use the Asterisk Manager service (AMI) to get the actual status of the server',
        options     : {
            target : {
                type : 'ip',
                description  : 'IP address to brute-force',
                defaultValue : '127.0.0.1'
            },
            port : {
                type         : 'port',
                description  : 'Port of the server',
                defaultValue : 5038
            },
            user : {
                type         : 'allValid',
                description  : 'User to use in the request',
                defaultValue : 'admin'
            },
            password : {
                type         : 'allValid',
                description  : 'Password to use in the request',
                defaultValue : 'amp111'
            },
            timeout : {
                type         : 'positiveInt',
                description  : 'Time to wait for a response (ms.)',
                defaultValue : 5000
            }
        }
    };

// Public stuff

module.exports.help = HELP;
module.exports.run = function (options, callback) {
   var connected = false,
       ami       = new Nami({
           host     : options.target,
           port     : options.port,
           username : options.user,
           secret   : options.password
       });

   ami.logger.setLevel('OFF');

   ami.on('namiConnected', function () {
       var action = new namiLib.Actions.Status();

       connected = true;
       ami.send(action, function (res) {
           ami.close();
           callback(null, res);
       });
   });

   ami.on('namiLoginIncorrect', function () {
       callback({
           type : 'login'
       });
   });

   // The module does not support connection timeout, so
   // we add it manually ("connected" var), really dirty trick
   setTimeout(function () {
       if (!connected) {
           callback({
               type : 'timeout'
           });
       }
   }, options.timeout);
   ami.open();
};
