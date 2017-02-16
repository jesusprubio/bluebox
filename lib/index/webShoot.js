/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the GPLv3 license found at
  http://www.gnu.org/licenses/gpl-3.0.txt.
*/

'use strict';


const phantom = require('phantom');

const errMsgs = require('../utils/errorMsgs');
const utils = require('../utils');

const Promise = utils.Promise;
const dbg = utils.dbg(__filename);


module.exports = (url, opts = {}) =>
  new Promise((resolve, reject) => {
    const result = {};
    const uaStr = opts.ua || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 ' +
                             ' (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36';
    const outPath = opts.path || `${process.cwd()}shoot-${new Date().toISOString()}.png`;

    if (!url) {
      reject(new Error(errMsgs.paramReq));

      return;
    }

    if (!utils.validator.isURL(url)) {
      reject(new Error(errMsgs.paramBad));

      return;
    }

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

        page.open(url)
        .then(() => {
          dbg('Page opened, shooting ...', { url });
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
            reject(new Error(`Taking the screenshoot: ${url}: ${err.message}`));
          });
        })
        .catch((err) => {
          phInstance.exit();
          reject(new Error(`Opening the website: ${url}: ${err.message}`));
        });
      })
      .catch((err) => {
        phInstance.exit();
        reject(new Error(`phantom (createPage): ${err.message}`));
      });
    })
    .catch(err => reject(new Error(`phantom (create): ${err.message}`)));
  });
