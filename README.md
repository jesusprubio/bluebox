**UNMAINTAINED!**

# Bluebox-ng
VoIP pentesting framework written using Node powers. Our 2 cents to make the Node world still more awesome. ;)
- **IRC(Freenode)**: #assaultjs
- [**Demo**](https://www.youtube.com/watch?v=M-6k4Md3qEQ)

<img src="https://lh6.googleusercontent.com/-GfcMGzI-qSQ/VDWt9U8GGWI/AAAAAAAAKmU/csRGEN1XtwA/s551-no/blueboxLogo250.png" height="150" width="150" >

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
- VirusTotal IP, URL and domain
- Geolocation
- Colored output
- Command completion
- Cross-platform support

## Install
- Tested with [io.js](https://iojs.org/) v1.6.4 and [node.js™](http://nodejs.org/) v0.12.x.
- [Nmap](http://nmap.org/) optional.
`npm i -g bluebox-ng`

### Kali GNU/Linux
- `curl -sL https://raw.githubusercontent.com/jesusprubio/bluebox-ng/master/artifacts/installScripts/kali.sh | sudo bash -`

## Use
- Console client: ```bluebox-ng```
- As a library:
```javascript
var Bluebox = require('bluebox-ng'),

    bluebox = new Bluebox({}),
    moduleOptions = {
        target: '8.8.8.8'
    };

console.log('Modules info:');
console.log(JSON.stringify(bluebox.getModulesInfo(), null, 2));

bluebox.runModule('geoLocate', moduleOptions, function (err, result) {
    if (err) {
        console.log('ERROR:');
        console.log(err);
    } else {
        console.log('RESULT:');
        console.log(result);
    }
});
```

## Issues
- https://github.com/jesusprubio/bluebox-ng/issues

## Developer guide
- Start coding with one of the actual modules similar to the new one as a boilerplate.
- Use [GitHub pull requests](https://help.github.com/articles/using-pull-requests).
- Conventions:
 - We use [JSHint](http://jshint.com/) and [Crockford's Styleguide](http://javascript.crockford.com/code.html).
 - Please run `grunt contribute` to be sure your code fits with them.

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
- Jose Luis Verdeguer ([@pepeluxx](https://twitter.com/pepeluxx)), my mate playing with VoIP security related stuff.
- Damián Franco ([@pamojarpan](https://twitter.com/pamojarpan)), help during first steps.
- [Quobis](http://www.quobis.com), some hours of work through personal projects program.
- Antón Román ([@antonroman](https://twitter.com/antonroman)), my SIP mentor.
- Sandro Gauci ([@sandrogauci](https://twitter.com/sandrogauci)), SIPVicious was my inspiration.
- Kamailio community ([@kamailioproject](https://twitter.com/kamailioproject)), my favourite SIP Server.
- David Endler and Mark Collier ([@markcollier46](https://twitter.com/markcollier46)), the authors of ["Hacking VoIP Exposed" book](http://www.hackingvoip.com/).
- John Matherly ([@achillean](https://twitter.com/achillean)) for the SHODAN API and GHDB.
- Tom Steele ([@_tomsteele](https://twitter.com/_tomsteele)) and the rest of [exploitsearch.net](http://www.exploitsearch.net/) team.
- [VirusTotal](https://www.virustotal.com/) friends.
- All developers who have written the Node.js modules used in the project.
- All VoIP, free software and security hackers that I read everyday.
- My friend Carlos Pérez, the logo designer.

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
