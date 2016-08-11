# Bluebox-ng

[![Black Hat Arsenal](https://www.toolswatch.org/badges/arsenal/2014.svg)](https://www.blackhat.com/eu-14/arsenal.html)
[![Continuos integration](https://api.travis-ci.org/jesusprubio/bluebox-ng.svg)](https://travis-ci.org/jesusprubio/bluebox-ng)
[![NSP Status](https://nodesecurity.io/orgs/bluebox-ng/projects/108045b9-2ea5-45be-b4d6-0b8ca1cdb8a7/badge)](https://nodesecurity.io/orgs/bluebox-ng/projects/108045b9-2ea5-45be-b4d6-0b8ca1cdb8a7)

[![npm info](https://nodei.co/npm/bluebox-ng.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/bluebox-ng)

Pentesting framework using Node.js powers. Specially focused in VoIP/UC.

<img src="http://jesusprubio.name/images/projects/bbng-logo.png" height="150" width="150" ><img src="http://jesusprubio.name/images/projects/bluebox.gif" height="150">


## Features
- Auto VoIP/UC penetration test
- Report generation
- Performance
- RFC compliant
- SIP TLS and IPv6 support
- SIP over websockets (and WSS) support (RFC 7118)
- SHODAN, exploitsearch.net and Google Dorks
- SIP common security tools (scan, extension/password bruteforce, etc.)
- Authentication and extension brute-forcing through different types of SIP requests
- SIP Torture (RFC 4475) partial support
- SIP SQLi check
- SIP denial of service (DoS) testing
- Web management panels discovery
- DNS brute-force, zone transfer, etc.
- Other common protocols brute-force: Asterisk AMI, MySQL, MongoDB, SSH, (S)FTP, HTTP(S), TFTP, LDAP, SNMP
- Some common network tools: whois, ping (also TCP), traceroute, etc.
- Asterisk AMI post-explotation
- Dumb fuzzing
- Automatic exploit searching (Exploit DB, PacketStorm, Metasploit)
- Automatic vulnerability searching (CVE, OSVDB, NVD)
- Geolocation
- Command completion
- Cross-platform support


## Install
- Install the last Node.js stable version.
 - https://nodejs.org/download
 - A better alternative for developers is to use [nvm](https://github.com/creationix/nvm), to test different versions.

- Get a copy of the code and install Node dependencies.
```sh
npm i -g bluebox-ng
```

### Kali GNU/Linux
- `curl -sL https://raw.githubusercontent.com/jesusprubio/bluebox-ng/master/artifacts/installScripts/kali2.sh | sudo bash -`


## Use
- Console client: ```bluebox-ng```
- As a library:
```javascript
const Bluebox = require('bluebox-ng');

const bluebox = new Bluebox({});
const moduleOptions = { target: '8.8.8.8' };


console.log('Modules info:');
console.log(JSON.stringify(bluebox.help(), null, 2));

bluebox.runModule('geolocation', moduleOptions, (err, result) => {
  if (err) {
    console.log('Error:');
    console.log(err);
  } else {
    console.log('Result:');
    console.log(result);
  }
});
```


## Issues
- https://github.com/jesusprubio/bluebox-ng/issues


## Developer guide
- Start coding with one of the actual modules similar to the new one as a boilerplate.
- Use [GitHub pull requests](https://help.github.com/articles/using-pull-requests).

### Conventions:
 - We use [ESLint](http://eslint.org/) and [Airbnb](https://github.com/airbnb/javascript) style guide.
- Please run to be sure your code fits with it and the tests keep passing:
```sh
npm run-script cont-int
```

### Debug
We use the [visionmedia module](https://github.com/visionmedia/debug), so you have to use this environment variable:
```sg
DEBUG=bluebox* npm start
```

### Commit messages rules:
 - It should be formed by a one-line subject, followed by one line of white space. Followed by one or more descriptive paragraphs, each separated by one￼￼￼￼ line of white space. All of them finished by a dot.
 - If it fixes an issue, it should include a reference to the issue ID in the first line of the commit.
 - It should provide enough information for a reviewer to understand the changes and their relation to the rest of the code.


## Core devs
- Jesús Pérez
 - [@jesusprubio](https://twitter.com/jesusprubio)
 - jesusprubio gmail com
 - [http://jesusprubio.name/](http://jesusprubio.name/)

- Sergio García
 - [@s3rgiogr](https://twitter.com/s3rgiogr)
 - s3rgio.gr gmail com


## Contributors
- https://github.com/jesusprubio/bluebox-ng/graphs/contributors


## Thanks to
- Our mentors: [@antonroman](https://twitter.com/antonroman), [@sandrogauci](https://twitter.com/sandrogauci) (SIPVicious was our inspiration), [@pepeluxx](https://twitter.com/pepeluxx), [@markcollier46](https://twitter.com/markcollier46) (["Hacking VoIP Exposed"](http://www.hackingvoip.com/)).
- [Quobis](http://www.quobis.com), some hours of work through personal projects program.
- Kamailio community ([@kamailioproject](https://twitter.com/kamailioproject)), our favourite SIP Server.
- John Matherly ([@achillean](https://twitter.com/achillean)) for the SHODAN.
- Tom Steele ([@_tomsteele](https://twitter.com/_tomsteele)) and the rest of [exploitsearch.net](http://www.exploitsearch.net/) team.
- All developers who have written the Node.js modules used in the project.
- All VoIP, free software and security hackers that we read everyday.
- Our friend Carlos Pérez, the logo designer.


## License
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
