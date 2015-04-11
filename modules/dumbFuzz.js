/*
    Copyright Sergio García <s3rgio.gr gmail com>

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

var SteroidsSocket = require('sip-fake-stack').SteroidsSocket,
    printer = require('../utils/printer'),

    HELP = {
        description: 'Really stupid app layer fuzzer (support:' +
                     'UDP, TCP, TLS, [secure] websockects)',
        options: {
            target: {
                type: 'ip',
                description: 'Host to attack',
                defaultValue: '127.0.0.1'
            },
            port: {
                type: 'port',
                description: 'Port to attack on chosen IPs',
                defaultValue: 1337
            },
            transport: {
                type: 'transports',
                description: 'Underlying protocol',
                defaultValue: 'TCP'
            },
            wsPath: {
                type: 'allValid',
                description: 'Websockets path (only when websockets)',
                defaultValue: 'ws'
            },
            wsProto: {
                type: 'allValid',
                description: 'Websockets protocol (only when websockets)',
                defaultValue: 'sip'
            },
            payload: {
                type: 'allValid',
                description: 'Stuff to send',
                defaultValue: 'A'
            },
            timeout: {
                type: 'positiveInt',
                description: 'Time to wait for a response, in ms.',
                defaultValue: 5000
            }
        }
    },
    fuzzString = '',
    payload, lastSent, megaSocket;


// Simply takes the current string and add another payload string
function mutate(oldPayload) {
    return oldPayload + payload;
}

// Muting and sending the payload,
// we're doing it over the last mutated value
function send() {
    fuzzString = mutate(fuzzString);
    megaSocket.send(fuzzString);

    // The message which is being sent
    lastSent = fuzzString;
    // Omit printint to increase performance
    printer.infoHigh('Packet sent:');
    printer.highlight(fuzzString);
}


// Public stuff

module.exports.help = HELP;

module.exports.run = function (options, callback) {
    var socketCfg = {
            target: options.target,
            port: options.port,
            transport: options.transport,
            timeout: options.timeout
        },
        answering = false;

    payload = options.payload;

    megaSocket = new SteroidsSocket(socketCfg);
    // Sending initial request
    send();

    // We reuse the same socket for now
    megaSocket.on('error', function (err) {
        if (!answering) {
            callback(err);
        } else {
            callback(null, {
                lastSent: lastSent
            });
            printer.info('Boom!, last packet sent:');
            printer.highlight(lastSent);
        }
    });

    //megaSocket.on('message', function (msg) {
    megaSocket.on('message', function () {
        answering = true;

        printer.info('Response received');

        // Server is still answering, so keep muting
        send();
    });
};
