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


const request = require('request');
const async = require('async');
const lodash = require('lodash');
const networkUtils = require('../utils/network');
const logger = require('../utils/logger');

module.exports.help = {
  description: 'HTTP paths brute force',
  options: {
    baseUri: {
      type: 'allValid',
      description: 'Base URI to brute-force',
      defaultValue: 'http://127.0.0.1',
    },
    paths: {
      type: 'userPass',
      description: 'Path (or file with them) to test',
      defaultValue: 'file:artifacts/dics/http/voip.txt',
    },
    delay: {
      type: 'positiveInt',
      description: 'Delay between requests, in ms.',
      defaultValue: 0,
    },
    timeout: {
      type: 'positiveInt',
      description: 'Time to wait for a response, in ms.',
      defaultValue: 5000,
    },
  },
};


module.exports.run = (options, callback) => {
  const finalUris = [];
  const result = [];
  let indexCount = 0; // User with delay to know in which index we are
  let baseUri;

  if (options.baseUri.substr(options.baseUri.length - 1) === '/') {
    baseUri = options.baseUri.slice(0, -1);
  } else {
    baseUri = options.baseUri;
  }

  lodash.each(options.paths, path => {
    // to support different ports
    if (path.slice(0, 1) === ':') {
      finalUris.push(baseUri + path);
    } else {
      finalUris.push(`${baseUri} / ${path}`);
    }
  });

  async.eachSeries(finalUris, (finalUri, asyncCb) => {
    // to avoid blocking
    const customHeaders = {
      'User-Agent': networkUtils.customHttpAgent(),
    };
        // It follows redirects by default (default: followRedirect = true)
    const cfg = {
      uri: finalUri,
      method: 'GET',
      headers: customHeaders,
      json: false,
      timeout: options.timeout,
      strictSSL: false,
    };

    function delayCb() {
      if (indexCount === finalUris.length) {
        asyncCb();
      } else {
        setTimeout(asyncCb, options.delay);
      }
    }

    indexCount += 1;
    request.get(cfg, (err, res) => {
      // TODO: Destroy/close client, not supported by the module
      if (err) {
        delayCb(err);
      } else if (!err && res.statusCode !== 404) {
        result.push({
          path: finalUri,
          code: res.statusCode,
          body: res.body,
        });
        logger.highlight(`Valid path found: ${finalUri}`);
        delayCb();
      } else {
        logger.infoHigh(`Valid path NOT found: ${finalUri}`);
        delayCb();
      }
    });
  }, err => {
    callback(err, result);
  });
};
