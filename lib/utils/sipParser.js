// Copyright Jesus Perez <jesusprubio gmail com>
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

const lodash = require('lodash');

const grammar = {
  versionRE: /(\d{1,2}(\.\d{1,2})?(\.\d{1,2}})?)/,
  portRE: /\d{2,5}/,
  portRangeRE: /(\d{1,5})-(\d{1,5})/,
  extRE: /\d{1,10}/,
  extRangeRE: /\d{1,10}-\d{1,10}/,
  userRE: /User\-Agent:/i,
  serverRE: /Server:/i,
  orgRE: /Organization:/i,
  codeLineRE: /SIP\/2.0/,
  codeRE: /\d{3}/,
  fileRE: /\.txt/,
  authRE: /WWW-Authenticate:/i,
  authProxyRE: /Proxy-Authenticate:/i,
  realmRE: /realm/i,
  nonceRE: /nonce/i,
  httpRE: /http:\/\//,
};


function splitMsg(msg) {
  return msg.toString().split('\r\n');
}


// It parses "User-Agent" string from a packet.
module.exports.userAgent = pkt => {
  const userLine = lodash.filter(splitMsg(pkt), line => grammar.userRE.test(line));

  if (userLine[0]) { return (userLine[0]).split(':')[1]; }

  return null;
};


module.exports.code = pkt => {
  const codeLine = lodash.filter(splitMsg(pkt), line => grammar.codeLineRE.test(line));

  if (codeLine[0]) { return (codeLine[0]).match(grammar.codeRE)[0]; }

  return null;
};


// It parses "Server" string from a packet.
module.exports.server = pkt => {
  const serverLine = lodash.filter(splitMsg(pkt), line => { grammar.serverRE.test(line); });

  if (serverLine[0]) { return (serverLine[0]).split(':')[1]; }

  return null;
};


// It parses "Organization" string from a packet.
module.exports.organization = pkt => {
  const orgLine = lodash.filter(splitMsg(pkt), line => grammar.orgRE.test(line));

  if (orgLine[0]) { return (orgLine[0]).split(':')[1]; }

  return null;
};

// It parses the service from a string.
module.exports.service = fprint => {
  let service;
  let cutString;

  // TODO: Refactor this
  const match = /fpbx/i.test(fprint.toString());
  if (match) {
    service = 'FreePBX';
  } else {
    cutString = fprint.split(' ');
    if (cutString[2]) {
      service = cutString[1];
    } else {
      cutString = fprint.split('-');
      if (cutString[1]) {
        service = cutString[0];
      } else {
        cutString = fprint.split('/');
        if (cutString[1]) {
          service = cutString[0];
        } else {
          service = fprint;
        }
      }
    }
  }

  return service;
};


// It parses the service version from a string.
module.exports.version = fprint => {
  if (fprint && fprint.match(grammar.versionRE) &&
      ((fprint.match(grammar.versionRE))[0])) {
    return (fprint.match(grammar.versionRE))[0];
  }

  return null;
};

function parseAuth(line) {
  // It should appears only once
  return (grammar.authRE.test(line) || grammar.authProxyRE.test(line))[0];
}

module.exports.realmNonce = pkt => {
  const splittedMsg = splitMsg(pkt);
  let isProxy = false;
  let authLine = lodash.filter(splittedMsg, parseAuth);
  let authSplit;
  let nonce;
  let realm;


  if (grammar.authProxyRE.test(authLine)) { isProxy = true; }
  if (!authLine) {
  // Deleting "Proxy-Authenticate" or "WWW-Authenticate" from the string.
    if (isProxy) {
      authLine = authLine.slice(20);
    } else {
      authLine = authLine.slice(18);
    }
    authSplit = authLine.split(',');

    for (let i = 0; i < authSplit.length; i++) {
      if (grammar.realmRE.test(authSplit[i])) {
        realm = (authSplit[i].split('='))[1].slice(1, -1);
      }
      if (grammar.nonceRE.test(authSplit[i])) {
        nonce = (authSplit[i].split('='))[1].slice(1, -1);
      }
    }

    return { realm, nonce, isProxy };
  }

  return null;
};
