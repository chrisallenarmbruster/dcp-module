const net = require("net");

function createServer(requestHandler) {
  const server = net.createServer((socket) => {
    socket.on("data", (data) => {
      const dcpRequest = parseDCPRequest(data.toString());
      const dcpResponse = new DCPResponse(socket);

      requestHandler(dcpRequest, dcpResponse);
    });
  });

  return server;
}

function DCPResponse(socket) {
  this.send = function (responseData) {
    socket.write(responseData);
  };
}

function parseDCPRequest(requestString) {
  const requestLineEnd = requestString.indexOf("\r\n");
  if (requestLineEnd === -1) return null;

  const requestLine = requestString.substring(0, requestLineEnd);
  const parts = requestLine.split(" ");

  let methodOperator = null;
  let requestMethod;
  let dcpRequestUri, dcpVersion;

  if (parts.length === 3) {
    const methodIndex = parts[0].indexOf("!");
    if (methodIndex !== -1) {
      methodOperator = parts[0].substring(0, methodIndex);
      requestMethod = parts[0].substring(methodIndex + 1);
    } else {
      requestMethod = parts[0];
    }
    [dcpRequestUri, dcpVersion] = [parts[1], parts[2]];
  } else {
    return null;
  }

  return { methodOperator, requestMethod, dcpRequestUri, dcpVersion };
}

function createClient() {
  const client = new net.Socket();

  return {
    connect: (host, port, callback) => {
      client.connect(port, host, callback);
    },
    sendRequest: (request, onResponse) => {
      client.write(request);

      client.on("data", (data) => {
        onResponse(data.toString());
      });

      client.on("error", (error) => {
        console.error("Client Error:", error);
      });
    },
    disconnect: () => {
      client.end();
    },
  };
}

module.exports.createServer = createServer;
module.exports.createClient = createClient;
