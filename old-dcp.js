const DCPServer = require("./old-dcpserver");
const DCPClient = require("./old-dcpclient");

function createServer(requestHandler) {
  return new DCPServer(requestHandler);
}

function createClient() {
  return new DCPClient();
}

module.exports.createServer = createServer;
module.exports.createClient = createClient;
