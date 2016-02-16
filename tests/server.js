'use strict';
const Hapi = require('hapi');
const sources = require("./api");

const server = new Hapi.Server();
const port = process.env.PORT || 3000;
server.connection({
  port: parseInt(port),
  labels: ['api'],
  routes: {
    cors: {
      origin: ['*'],
      exposedHeaders: ['X-Current-User', 'X-Token']
    }
  }
});
sources.populate(server);

server.state('data', {
  ttl: null,
  isSecure: false,
  isHttpOnly: false,
  encoding: 'base64json',
  clearInvalid: false, // remove invalid cookies
  strictHeader: true // don't allow violations of RFC 6265
});

module.exports = server;
