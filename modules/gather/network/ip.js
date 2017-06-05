/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const getIp = require('icanhazip').IPv4;
const address = require('address');
const wifiName = require('wifi-name');


module.exports.desc = 'Get info for a network interface: IPv4,' +
                      ' IPv6, MAC and DNS.';

module.exports.opts = {
  iface: {
    desc: 'Network interface',
    default: 'eth0',
  },
  external: {
    types: 'bool',
    desc: 'Get also your external IP ',
    default: true,
  },
  wifi: {
    types: 'bool',
    desc: 'Show connected AP info',
    default: true,
  },
};


module.exports.impl = opts =>
  new Promise((resolve, reject) => {
    address(opts.iface, (err, addrs) => {
      if (err) {
        reject(err);
        return;
      }

      const result = { addrs };

      address.dns((errD, dns) => {
        if (err) {
          reject(err);
          return;
        }

        result.dns = dns;

        if (!opts.external) {
          resolve(result);
          return;
        }

        getIp()
        .then((ext) => {
          result.ext = ext;

          if (!opts.wifi) {
            resolve(result);
            return;
          }

          wifiName()
          .then((wifi) => {
            result.wifi = wifi;
            resolve(result);
          })
          .catch(errW => reject(errW));
        })
        .catch(errIp => reject(errIp));
      });
    });
  });
