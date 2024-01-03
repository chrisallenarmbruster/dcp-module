const DCPServer = require("./dcpserver");
const DCPClient = require("./dcpclient");

function createServer(requestHandler) {
  return new DCPServer(requestHandler);
}

function createClient() {
  return new DCPClient();
}

module.exports.createServer = createServer;
module.exports.createClient = createClient;
