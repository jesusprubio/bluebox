/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const EventEmitter = require('events').EventEmitter;
// const http = require('http');
// const crypto = require('crypto');

// const WebSocketServer = require('websocket').server;

const pkgInfo = require('./package.json');
const utils = require('./lib/utils');
const parseOpts = require('./lib/parseOpts');
const parsers = require('./lib/parsers');
const errMsgs = require('./cfg/errorMsgs').index;

const dbg = utils.dbg(__filename);


class Cli {

  // constructor(opts = {}) {
  constructor() {
    this.version = pkgInfo.version;
    this.dics = parsers.dics;
    // Events with extra info.
    this.events = new EventEmitter();
    // To keep the gathered info.
    this.hosts = {};
    // this.token;
    // this.wsServer;

    dbg('Loading modules ...');
    const modulesRaw = utils.requireDir(module, './modules');
    dbg('Creating our module names from their paths ...');
    this.modules = {};
    utils.each(Object.keys(modulesRaw), (modulePath) => {
      utils.each(Object.keys(modulesRaw[modulePath]), (subPath) => {
        // Only 3 levels allowed for now.
        // To get the ones without a subfolder.
        if (modulesRaw[modulePath][subPath].impl) {
          this.modules[`${modulePath}/${subPath}`] = modulesRaw[modulePath][subPath];
        } else {
          utils.each(Object.keys(modulesRaw[modulePath][subPath]), (lastPath) => {
            if (modulesRaw[modulePath][subPath][lastPath].impl) {
              this.modules[`${modulePath}/${subPath}/${lastPath}`] =
                modulesRaw[modulePath][subPath][lastPath];
            } else {
              utils.each(Object.keys(modulesRaw[modulePath][subPath][lastPath]), (oneMore) => {
                this.modules[`${modulePath}/${subPath}/${lastPath}/${oneMore}`] =
                  modulesRaw[modulePath][subPath][lastPath][oneMore];
              });
            }
          });
        }
      });
    });

    dbg('Started', { version: pkgInfo.version });
  }


  addResult(hostName, modName, modRes) {
    if (!this.hosts[hostName]) { this.hosts[hostName] = {}; }
    if (!this.hosts[hostName].modName) { this.hosts[hostName][modName] = []; }
    // Adding to the hosts and printing.
    this.hosts[hostName][modName].push({ timestamp: new Date(), result: modRes });
  }

  // Should always return a promise.
  run(moduleName, passedOpts = {}) {
    return new Promise((resolve, reject) => {
      dbg('Running module:', { name: moduleName, passedOpts });

      if (!this.modules[moduleName]) {
        reject(new Error(errMsgs.notFound));
        return;
      }

      const blueModule = this.modules[moduleName];

      // Parsing the paremeters passed by the client.
      let opts;
      try {
        opts = parseOpts(passedOpts, blueModule.opts);
      } catch (err) {
        reject(new Error(`${errMsgs.parseOpts} : ${err.message}`));
        return;
      }
      // We needs to emit inside some modules.
      opts.events = this.events;

      // Needed to add the result (if correct) to the report.
      let actualTarget;
      if (opts.rhost) { actualTarget = opts.rhost; }
      // TOOD: Resolve to a IP and use it as key.
      if (opts.domain) { actualTarget = opts.domain; }
      if (opts.url) { actualTarget = opts.url; }

      blueModule.impl(opts)
      .then((res) => {
        if (actualTarget) {
          this.addResult(actualTarget, moduleName, res);
        } else if (opts.rhosts) {
          utils.each(res, singleRes => this.addResult(singleRes.ip, moduleName, singleRes.data));
        }

        resolve(res);
      })
      .catch(err => reject(err));
    });
  }
}

module.exports = Cli;


  // TODO
  // Should always return a promise.
  // apiStart(port) {
  //   return new Promise((resolve, reject) => {
  //     // The headers are not present after the first request (wsServer.on('request').
  //     // So we need this to store them because when the "wsServer.on('connect')" only
  //     // provides the ip and port to identify the connection.
  //     // We sonly allow one client at time for now.
  //     const client = { ip: null, port: null, conn: null };

  //     if (this.wsServer) {
  //       reject(new Error('Server is already up'));

  //       return;
  //     }

  //     // Secure token.
  //     this.token = crypto.randomBytes(64).toString('hex');
  //     utils.info(`api: new token generated: ${this.token}`);

  //     // To attach an HTTP server is mandatory for this websocket library.
  //     dbg('Creating the HTTP server ...');
  //     const server = http.createServer((req, res) => {
  //       dbg(`Received request for: ${res.url}`);

  //       res.writeHead(204);
  //       res.end();
  //     });

  //     // TODO: Confirm https.
  //     dbg('Attaching the websockets server ...');
  //     this.wsServer = new WebSocketServer({
  //       httpServer: server,
  //       // TODO: Use origin control.
  //       autoAcceptConnections: false,
  //       maxReceivedFrameSize: 256 * 1024,
  //       fragmentOutgoingmsgs: false,
  //       // keepalive: false,
  //       // disableNagleAlgorithm: false
  //     });


  //     // https://github.com/theturtle32/WebSocket-Node/blob/master/docs/WebSocketServer.md
  //     // Setting when to accept or reject the new requests.
  //     wsServer.on('request', (req) => {
  //       const query = req.resourceURL.query;
  //       const headers = req.httpRequest.headers;
  //       const port = req.socket._peername.port; // eslint-disable-line no-underscore-dangle

  //       dbg('New request arrived', { headers, query, remoteAddress: req.remoteAddress, port });

  //       // TODO: Authentication still not supported by the module:
  //       // https://github.com/theturtle32/WebSocket-Node/issues/181
  //       // So, implementing it "manually".

  //       dbg('Checking security restrictions ...');
  //       // 401 -> Unauthorized.
  //       let errCode = 401;
  //       let errMsg;

  //       if (client.conn) {
  //         errMsg = 'Client already connected';
  //         // 412 -> Precondition Failed.
  //         errCode = 412;
  //       }
  //       if (!query.token) {
  //         errMsg = 'Token not present';
  //       } else if (query.token !== this.token) {
  //         errMsg = 'Bad token';
  //       }

  //       if (errMsg) {
  //         // We use "utils.info" because an app should log all login attempts.
  //         this.emit('info-api', {
  //           msg: 'New request rejected',
  //           remoteAddress: req.remoteAddress,
  //           port,
  //           headers,
  //         });
  //         req.reject(errCode, errMsg);

  //         return;
  //       }

  //       client.ip = req.remoteAddress;
  //       client.port = port;

  //       this.emit('info-api', {
  //         msg: 'New request acepted',
  //         remoteAddress: req.remoteAddress,
  //         port,
  //         headers,
  //       });

  //       try {
  //         req.accept('echo-protocol', req.origin);
  //       } catch (err) {
  //         const msg = 'Not valid protocol, please use "echo-protocol"';
  //         this.emit('info-api', {
  //           msg,
  //           remoteAddress: req.remoteAddress,
  //           port,
  //           headers,
  //         });
  //         // 400 -> Bad request.
  //         req.reject(400, msg);
  //       }
  //     });


  //     wsServer.on('connect', (conn) => {
  //       const port = conn.socket._peername.port; // eslint-disable-line no-underscore-dangle

  //       dbg('New connection attempt', {
  //         protocolVersion: conn.webSocketVersion,
  //         remoteAddress: conn.remoteAddress,
  //         port,
  //       });

  //       // The "remoteAddress" and "port" is the only common value
  //       // between "on('request')" and "on('connect')"
  //       if (conn.remoteAddress === client.ip && port === client.port) {
  //         dbg('New connection accepted');
  //         client.conn = conn;
  //       }

  //       conn.on('message', (msg) => {
  //         // dbg('New message received', msg);
  //         dbg('New message received');

  //         // We're not using binary for now.
  //         if (!msg || !msg.type  || msg.type === 'binary') {
  //           this.emit('info-api', {
  //             msg: 'Bad message format, ommited',
  //             remoteAddress: conn.remoteAddress,
  //           });

  //           return;
  //         }
  //         dbg('Correct message format, parsing the command ...');
  //         try {
  //           msgParsed = JSON.parse(msg.utf8Data);
  //         } catch (err) {
  //           dbg();
  //           return;
  //           this.emit('info-api', {
  //             msg: `Error parsing data: ${JSON.stringify(err)}`,
  //             remoteAddress: conn.remoteAddress,
  //           });
  //         }

  //         console.log('TODO FROM HERE');
  //         console.log(msgParsed);

  //         // if (msgParsed.TODO) {
  //         //   if (client.connected) {
  //         //     connToSend.sendUTF(msg.utf8Data, (err) => {
  //         //       if (err) {
  //         //         utils.error('Sending the response', err);
  //         //         client.conn.drop();
  //         //       } else {
  //         //         dbg('Response correctly sent');
  //         //       }
  //         //     });

  //         //     dbg('Proper connection is ready, so forwarding the message to the other side');
  //         //   } else {
  //         //     dbg('Redirect not done because the other side is still not connected');
  //         //   }
  //         // });
  //       });

  //       conn.on('close', (reasonCode, desc) => {
  //         // delete conns.radares[`${conn.remoteAddress}:${port}`];
  //         this.emit('info-api', {
  //           msg: 'Client disconnected',
  //           reasonCode,
  //           description: desc,
  //           ip: conn.remoteAddress,
  //         });
  //       });
  //     });


  //     // TODO: Add error checking
  //     server.listen(port, () => utils.info(`Server listening on: https://127.0.0.1/${port}`));
  // }

  // apiStop() {
  //   if (!this.wsServer) {
  //     return Promise.reject(new Error('The HTTP API is not started'));
  //   }
  //   try {
  //     this.wsServer.shutDown();
  //     this.wsServer = null;
  //   } catch (err) {
  //     reject(err);
  //   }
  // }
// }
