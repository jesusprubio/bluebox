# API

This library includes the next methods and some other objects (ie: "dns") to group some another related ones.
- All async methods return a promise.
- Different errors are thrown. Promises are also rejected with errors.

## `version() -> string`
Returns the actual version of the library.

`1.0.0`

## `trace(rhost) -> Promise`
Display the route of your packages. A wrapper for [nodejs-traceroute](https://github.com/zulhilmizainuddin/nodejs-traceroute).
- `rhost` (string) - IP address.

```
[
  { '10.3.8.1': [ 8.457 ] },
  { '81.136.131.114': [ 11.962 ] },
  { '77.42.22.31': [ 11.95 ] },
  { '191.133.5.121': [ 22.754 ] },
  { '73.18.112.121': [ 21.635 ] },
  { '216.239.49.149': [ 22.131 ] },
  { '8.8.8.8': [ 21.272 ] }
]
```

## `ping(rhosts, opts) -> Promise`
Ping protocol client. A wrapper for [node-ping](https://github.com/danielzzz/node-ping).
- `rhosts` (string Array) - IP addresses.
- `opts` is an object with:
 - `attempts` (number) - Number of times to try. (default: 3)

```
{
  host: '8.8.8.8'
  alive: true,
  output: 'PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=58 time=24.149 ms\n\n--- 8.8.8.8 ping statistics ---\n1 packets transmitted, 1 packets received, 0.0% packet loss\nround-trip min/avg/max/stddev = 24.149/24.149/24.149/0.000 ms\n',
  time: 24.149
}
```


## `externalIp() -> Promise`
Get your external IP Address. A wrapper for [icanhazip](https://github.com/runvnc/icanhazip).

`78.22.182.183`

## `geo(rhost) -> Promise`
Geolocate a host using [freegeoip.net](https://freegeoip.net/). A wrapper for [iplocation](https://github.com/roryrjb/iplocation).
- `rhost` (string) - IP address.

```
{
  country_code: 'US',
  country_name: 'United States',
  region_code: 'CA',
  region_name: 'California',
  city: 'Mountain View',
  zip_code: '94035',
  time_zone: 'America/Los_Angeles',
  latitude: 37.386,
  longitude: -122.0838,
  metro_code: 807
}
```

## `whois(target) -> Promise`
WHOIS protocol client. A wrapper for [whois](https://github.com/hjr265/node-whois).
- `target` (string) - Fully qualified domain name (ie. example.com) or IP address.

```
Result:
Domain Name: RIBADEO.ORG
Domain ID: D3629499-LROR
WHOIS Server:
Referral URL: http://www.dinahosting.com
Updated Date: 2016-01-18T08:35:13Z
Creation Date: 1999-01-24T05:00:00Z
Registry Expiry Date: 2021-01-24T05:00:00Z
Sponsoring Registrar: Dinahosting s.l.
Sponsoring Registrar IANA ID: 1262

...
```

## `webShoot(url, opts) -> Promise`
WHOIS protocol client. A wrapper for [whois](https://github.com/hjr265/node-whois).
- `url` (string) - Valid URI.
- `opts` is an object with:
  - `path` (string) - Path (global) of the picture to generate (default: same folder from where the Node process was launched).
  - `ua` (string) - User agent to use (default: browser standard).

```
{
  path: "/home/test/pic.png",
}
```


## `map(rhosts, opts) -> Promise`
Network mapping.
- `rhosts` (Iterator) - With valid IPv4 rhosts.
- `opts` is an object with:
 - `proto` (string) - Application protocol to use. Options: 'ping', 'pingTcp', 'sip', 'ssh', 'ftp', 'http', ['ami'](https://wiki.asterisk.org/wiki/pages/viewpage.action?pageId=4817239). (default: 'sip')
 - `rports` (Iterator) - Ports to inspect in each host. (default: depending protocol)
 - `timeout` (number) - Time to wait for a response (in ms.). (default: 5000)
 - `concurrency` (number) - Max number of simultaneous socket opened. (default: 500)

```
[
  { ip: '127.0.0.1', port: 80, data: { headers: { 'Server' : 'X-Powered-By', ... },
  { ip: '127.0.0.1', port: 21, data: 'ProFTPD 1.3.4c Server (ProFTPD)' }
]
```

## `brute(rhost, opts) -> Promise`
Brute-force a service.
- `rhost` (string) - IP address.
- `opts` is an object with:
  - `proto` (string) - Application protocol to use. Options: 'sip', 'ssh', 'ftp', 'tftp', 'http', ['ami'](https://wiki.asterisk.org/wiki/pages/viewpage.action?pageId=4817239), 'mysql', 'mongo', 'ldap', 'snmp'. (default: 'sip')
  - `ports` (string) - Port to attack. (default: depending protocol, ie: 'ssh' -> 22)
  - `users` (Iterator) - Username list. (default: ['0000', '0001', '0002'])
  - `passwords` (Iterator) - Password list. (default: ['0000', '0001', '0002']). Not required in some case, ie: tftp.
  - `userAsPass` (boolean) - Add the user to the password list. (default: false)
  - `concurrency` (number) - Max number of requests to do in parallel. (default: 100)
  - `delay` (number) - Time to wait between batches of requests depending of th concurrency, in ms.. If this option is set then "concurrency" will become always 1. (default: 0)
  - `timeout` (number) - Time to wait for a response (in ms.). (default: 5000)

`[ ['foo', 'bar'], ['root', 'admin'] ]`

## `exploitSearch(query, opts) -> Promise`
Ping protocol client. A wrapper for [exploitsearch.js](https://github.com/jesusprubio/exploitsearch.js).
- `query` (string) - String to search.
- `opts` is an object with:
 - `exploitsOnly` (boolean) - To look only for exploits (not vulnerabilities). (default: 5000)
 - `timeout` (number) - Time to wait for a response (in ms.). (default: 5000)

```
[
  {
    name: 'ENTRY [BID 59533]',
    src: 'BID',
    id: 59533,
    info:
     { src: 'http://www.securityfocus.com/bid/59533',
       title: 'FreePBX &#039;page.backup.php&#039; Script Remote Command Execution Vulnerability',
       desc: 'FreePBX is prone to a remote command-execution vulnerability because the application ...',
       attack_type: 'Input Validation Error',
       copyright_title: 'SecurityFocus',
       copyright_link: 'http://www.securityfocus.com/' },
    exploits: [],
    refs: [],
    tools: [],
    links: [],
    dates:
     { initial: '2013-04-27 00:00:00',
       updated: '2013-04-27 00:00:00' }
  },
  {
    name: 'ENTRY [EXPLOITDB 29873]',
    src: 'EXPLOITDB',
    id: 29873,

  ...
  }
]
```

## `shodan.* -> Object`
A wrapper for [shodan-client.js](https://github.com/jesusprubio/shodan-client.js#api).

## `dns.reverse(rhost) -> Promise`
Reverse resolution.
- `rhost` (string) - IP address.

```
[ 'google-public-dns-a.google.com' ]`
```

## `dns.resolve(domain, opts) -> Promise`
Multiple records type resolution.
- `domain` (string) - Fully qualified domain name (ie. example.com).
- `opts` is an object with:
 - `rtype` (string) - Type of DNS record to look for. Options: 'A', 'AAAA', 'MX', 'TXT', 'SRV', 'PTR', 'NS',
   'CNAME', 'SOA', 'NAPTR' or 'ANY'. (default: 'ANY')

```
{
  A: [ '104.131.173.199' ],
  MX:
   [ { exchange: 'mxa.mailgun.org', priority: 10 },
     { exchange: 'mxb.mailgun.org', priority: 10 } ],
  AAAA: [ '2604:a880:800:10::126:a001' ],
  TXT:
   [ [ 'v=spf1 include:mailgun.org ~all' ],
     [ 'google-site-verification=sLdkuluh-xi3YZs_Uhobiw1XA_Wjalt8D8O_2jiwudg' ] ],
  SOA:
   { nsname: 'meera.ns.cloudflare.com',
     hostmaster: 'dns.cloudflare.com',
     serial: 2022051140,
     refresh: 10000,
     retry: 2400,
     expire: 604800,
     minttl: 3600 },
  NS: [ 'meera.ns.cloudflare.com', 'pablo.ns.cloudflare.com' ]
}
```

## `dns.axfr(domain, server) -> Promise`
[Zone transfer](https://en.wikipedia.org/wiki/DNS_zone_transfer). A wrapper for [dns-axfr](https://github.com/jpenalbae/dns-axfr).
- `domain` (string) - Domain to inspect. Fully qualified domain name.
- `server` (string) - Server to use. Fully qualified domain name (ie. example.com) or IP address.

```
TODO
```

## `dns.brute(domain, server, opts) -> Promise`
Subdomain brute-force. A wrapper for [subquest](https://github.com/skepticfx/subquest).
- `domain` (string) - Domain to inspect, fully qualified domain name.
- `server` (string) - Server to use, IP address.
- `opts` is an object with:
 - `rateLimit` (number) - Max. number of request at the same time. (default: 10)
 - `dictionary` (string) - Words to make the attack (in ms.). (default: top_100). We're using "subquest" module, so please check [here](https://github.com/skepticfx/subquest/tree/master/dictionary) the options.

```
TODO
```

## `wifi.scanAps() -> Promise`
Look for access points. A wrapper for [node-wifiscanner](https://github.com/mauricesvay/node-wifiscanner).

```
[
  {
    mac: 'd4:43:b0:00:00:00',
    ssid: 'casinhaou',
    channel: '100',
    signal_level: '-78',
    security: 'WPA(PSK/AES,TKIP/TKIP) WPA2(PSK/AES,TKIP/TKIP)'
  },
  {
    mac: 'cc:dd:32:22:13:c5',
    ssid: 'TheRoom',
    channel: '11',
  }

  ...
]
```

## `utils.validator -> Object`
To validate multiple common type from strings. A wrapper for [validator.js](https://github.com/chriso/validator.js) with some additions:
- `isPort(str) -> boolean`: To check if it's a number between 1 and 65535 (both included).
- `isPrivateIp(str) -> boolean`: To check if an IP address is a private one. A wrapper for [is-local-ip](https://github.com/DylanPiercey/is-local-ip)

## `utils.requireDir(module, path) -> Object`
- `path` (string) - Path of the folder to require. A wrapper for
To require one folder at the same time. A wrapper for [require-directory](https://github.com/troygoode/node-require-directory).

## `utils.ProductIterable -> Object`
To make a cartesian product of iterables or create a cartesian power of an iterable. A wrapper for [product-iterable](https://github.com/ksxnodemodules/product-iterable).

## `utils.localIp.getLocalIP4() -> String`
## `utils.localIp.getLocalIP6() -> String`
To get the first connected to internet network interface IP address. A wrapper for [quick-local-ip](https://github.com/aloksguha/myip).

## `utils.netCalc(ip, netmask) -> Object`
Get information about the network. A wrapper for [network-calculator](https://github.com/mertkahyaoglu/network-calculator).
- `ip` (string) - A valid IP address.
- `netmask` (string) - A valid network mask.
```
{
  network: '192.168.1.0',
  bitmask: 25,
  firsthost: '192.168.1.1',
  broadcast: '192.168.1.127',
  lasthost: '192.168.1.126',
  totalhost: 126
}
```

## `utils.ipInRange(ip, range) -> boolean`
To check if an IP matches one or more IP's or CIDR ranges. A wrapper for [ip-range-check](https://github.com/day8/ip-range-check).
- `ip` (string) - A valid IP address.
- `range` (string/Array) - A single CIDR or IP or an array of them: ie: "125.19.23.0/24", "2001:cdba::3257:9652", ["125.19.23.0/24", "2001:cdba::3257:9652"]
