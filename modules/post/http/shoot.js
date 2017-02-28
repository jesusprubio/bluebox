/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const path = require('path');

const phantom = require('phantom');

const utils = require('../../../lib/utils');
const defaultUa = require('../../../cfg/uas').http;

const dbg = utils.dbg(__filename);


module.exports.desc = 'Take a screenshoot of a website.';


module.exports.opts = {
  url: {
    types: 'url',
    desc: 'URL to explore',
    default: 'http://example.com/',
  },
  path: {
    desc: 'Path to store the output file (relative to from where Bluebox was launched)',
    default: '.',
  },
  // TODO: Support this parameter in the method.
  // timeout: {
  //   types: 'natural',
  //   desc: 'Time to wait for a response, in ms.',
  //   default: 5000,
  // },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    const finalOpts = opts;

    // TODO: Output file name hardcoded for now, add an option.
    if (opts.path) {
      finalOpts.path =
        path.resolve(process.cwd(), opts.path, `shoot-${new Date().toISOString()}.png`);
    }
    const result = {};
    const uaStr = opts.ua || defaultUa;
    const outPath = opts.path || `${process.cwd()}shoot-${new Date().toISOString()}.png`;

    dbg('Inspecting the web page ...');
    phantom.create(['--ignore-ssl-errors=yes'])
    .then((instance) => {
      const phInstance = instance;

      instance.createPage()
      .then((page) => {
        // eslint-disable-next-line no-param-reassign
        page.property('viewportSize', { width: 800, height: 600 });
        // eslint-disable-next-line no-param-reassign
        page.property('userAgent', uaStr);

        page.open(opts.url)
        .then(() => {
          dbg(`Page opened, shooting ..., url: "${opts.url}"`);
          page.render(outPath)
          .then(() => {
            // Phantom not needed anymore
            phInstance.exit();

            dbg('Shoot done correctly');
            result.path = outPath;
            resolve(result);
          })
          .catch((err) => {
            phInstance.exit();
            reject(new Error(`Taking the screenshoot: ${opts.url}: ${err.message}`));
          });
        })
        .catch((err) => {
          phInstance.exit();
          reject(new Error(`Opening the website: ${opts.url}: ${err.message}`));
        });
      })
      .catch((err) => {
        phInstance.exit();
        reject(new Error(`phantom (createPage): ${err.message}`));
      });
    })
    .catch(err => reject(new Error(`phantom (create): ${err.message}`)));
  });

