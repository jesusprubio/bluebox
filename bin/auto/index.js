#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

// Auto VoIP pentesting.

'use strict';

const fs = require('fs');
const path = require('path');

const utils = require('../../lib/utils');
const logger = require('../utils/logger');
const genTargets = require('./lib/genTargets');
const exploreHost = require('./lib/exploreHost');


const dbg = utils.dbg(__filename);
let profileNames = fs.readdirSync(path.resolve(__dirname, 'profiles'));
profileNames = utils.map(profileNames, profileName => path.basename(profileName, '.json'));


function map(box, host, profile) {
  return box.run('gather/sip/map', {
    targets: [host.ip],
    ports: [host.port],
    transport: host.transport,
    wsPath: host.wsPath,
    meth: host.meth,

    srcHost: profile.lHost,
    srcPort: profile.lPort,
    domain: profile.domain,
    delay: profile.delay,
    timeout: profile.timeout,
  });
}


module.exports = (bBox, rhosts, profileName, done) => {
  logger.infoHigh(`${logger.emoji('pizza')}  Starting the automatic mode ...\n`);

  // We neither parse nor check here because the modules are going to do it for us.
  // The user inputs were parsed in the calling method and we decided to trus in the
  // profile files.
  dbg('Parsed rhosts', rhosts);

  logger.info('Reading the profile file ...');
  const profilesPath = path.resolve(__dirname, 'profiles');
  let profilePath;
  if (utils.includes(profileNames, profileName)) {
    // If the user passes a built-in dictionary name.
    profilePath = path.resolve(profilesPath, `${profileName}.json`);
  } else {
    // If not we suppose a relative path.
    profilePath = path.resolve(process.cwd(), profileName);
  }
  // TODO: Use some async here.
  // eslint-disable-next-line import/no-dynamic-require,global-require
  const profileDefault = require(path.resolve(profilesPath, 'regular.json'));
  // eslint-disable-next-line import/no-dynamic-require,global-require
  let profile = require(profilePath);

  // The default one includes all possible fields, the rest only need to
  // include the redefinitions.
  if (profileName !== 'regular') { profile = utils.defaultsDeep(profile, profileDefault); }

  logger.infoHigh(`Using "${profilePath}" profile:`);
  logger.json(profile);

  // TODO: Domain support
  // if (parsers[domain] ...
  // logger.infoHigh('\nEXPLORING THE DOMAIN');
  // logger.infoHigh('\nGetting some info ...');
  // whois, robtex domain, DNS brute-force and DNS resolve apply here.
  // TODO: Use an iterator instead.
  const candidates = genTargets(
    rhosts,
    profile.map.services,
    profile.map.types,
    profile.map.wsPath
  );
  dbg('Target candidates', candidates);

  logger.infoHigh('\n\nINITIAL SIP MAP\n');
  logger.infoHigh(`Starting for ${candidates.length} candidate services\n\n`);

  logger.time('time');
  utils.pMap(candidates, hostInfo => map(bBox, hostInfo, profile))
  .then(() => {
    if (Object.keys(bBox.hosts).length === 0) {
      logger.result(`\n${logger.emoji('poop')} No candidate service found\n`);

      done();
      return;
    }

    logger.infoHigh('\n\nFROM HERE, WE EXPLORE EACH DISCOVERED HOST');
    logger.regular('\nFound hosts', bBox.hosts);

    logger.info('\nInspecting them ...');
    const hostsTrim = utils.map(Object.keys(bBox.hosts), pairStr => pairStr.split(':'));
    // TODO: Review this concurrency.
    utils.pMap(hostsTrim, host => exploreHost(bBox, host[0], host[1]), { concurrency: 1 })
    .then(() => {
      logger.timeEnd('time');
      logger.infoHigh(`\n${logger.emoji('airplane_arriving')}  Auto VoIP finished`);
      logger.title(`\n${logger.emoji('sparkles')}  Result`);
      if (!utils.isEmpty(Object.keys(bBox.hosts))) {
        logger.result(`${logger.emoji('poop')}  Empty\n`);
        return;
      }

      logger.json(bBox.hosts);
      // Print the html report if the proper option is present.
      logger.regular('\n');
      done();
    })
    .catch((err) => {
      logger.timeEnd('time');
      logger.error('Error, exploring the hosts', err);
      done();
    });
  })
  .catch((err) => {
    logger.error('Mapping the hosts', err);
    done();
  });
};

// TODO: Add AMI support.
