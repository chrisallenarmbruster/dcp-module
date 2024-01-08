const dgram = require("dgram");
const net = require("net");
const DCPRequest = require("./DCPRequest.js");
const DCPResponse = require("./DCPResponse.js");

class DCPNode {
  constructor(id) {
    this.id = id;
    this.messageHandler = null;
  }

  createResponseMessage(protocol, version, headers = {}, body = "") {
    return new DCPResponse(protocol, null, version, null, headers, body);
  }

  createRequestMessage(
    methodOperator,
    requestMethod,
    requestUri,
    version,
    protocol,
    headers = {},
    body = ""
  ) {
    return new DCPRequest(
      methodOperator,
      requestMethod,
      requestUri,
      version,
      protocol,
      headers,
      body
    );
  }

  async sendMessage(message, targetIpAddress, targetPort, protocol) {
    if (protocol === "TCP") {
      // Implement TCP sending logic
      return await this._sendTCPMessage(message, targetIpAddress, targetPort);
    } else if (protocol === "UDP") {
      // Implement UDP sending logic
      return this._sendUDPMessage(message, targetIpAddress, targetPort);
    } else {
      console.error("Unsupported protocol");
    }
  }

  //TODO: Consider adding response handler callback when TCP requests that are sent are expecting a response
  //TODO: We'll need to parse the response in this case, since the response will be sent to the callback
  _sendTCPMessage(message, targetIpAddress, targetPort) {
    return new Promise((resolve, reject) => {
      const formattedMessage = message.getFormattedMessage();
      const client = new net.Socket();

      client.connect(targetPort, targetIpAddress, () => {
        client.write(formattedMessage);

        if (!(message instanceof DCPRequest)) {
          client.end();
          resolve();
        }
      });

      if (message instanceof DCPRequest) {
        client.on("data", (data) => {
          client.end();
          const responseStr = data.toString("utf-8");
          resolve(responseStr);
        });

        client.on("timeout", () => {
          console.log("TCP request timed out.");
          client.end();
          reject(new Error("TCP request timed out"));
        });
      }

      client.on("error", (err) => {
        console.error("TCP Error:", err);
        client.end();
        reject(err);
      });
    });
  }

  //TODO: Consider adding response handler callback when UDP requests that are sent are expecting a response
  //TODO: add a map of request IDs to callbacks
  //TODO: We'll need to parse the response in this case, since the response will be sent to the callback
  _sendUDPMessage(message, targetIpAddress, targetPort) {
    const formattedMessage = message.getFormattedMessage();
    const udpSocket = dgram.createSocket("udp4");
    const messageBuffer = Buffer.from(formattedMessage);

    udpSocket.send(
      messageBuffer,
      0,
      messageBuffer.length,
      targetPort,
      targetIpAddress,
      (err) => {
        if (err) {
          console.error("UDP Error:", err);
        }
        udpSocket.close();
      }
    );
    return "UDP Message Sent";
  }

  listen(listenPort, messageHandler) {
    this.messageHandler = messageHandler;
    this._setupUDPServer(listenPort);
    this._setupTCPServer(listenPort);
  }

  _setupUDPServer(port) {
    const udpServer = dgram.createSocket("udp4");
    udpServer.on("message", (msg, rinfo) => {
      this._handleIncomingMessage(msg.toString(), "UDP", udpServer, rinfo);
    });
    udpServer.bind(port);
  }

  _setupTCPServer(port) {
    const tcpServer = net.createServer((socket) => {
      socket.on("data", (data) => {
        console.log("Received TCP message:", data.toString());
        this._handleIncomingMessage(data.toString(), "TCP", socket);
      });
    });
    tcpServer.listen(port);
  }

  _handleIncomingMessage(rawMessage, protocol, responseSocket, rinfo) {
    try {
      const parsedMessage = this._parseMessage(
        rawMessage,
        protocol,
        responseSocket,
        rinfo
      );

      if (parsedMessage instanceof DCPResponse) {
        // this._handleResponse(parsedMessage);
        this.messageHandler(null, parsedMessage);
      } else if (parsedMessage instanceof DCPRequest) {
        let version = "DCP/1.0";
        const res = new DCPResponse(protocol, responseSocket, version, rinfo);
        if (this.messageHandler) {
          this.messageHandler(parsedMessage, res);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  _parseMessage(rawMessage, protocol, responseSocket, rinfo) {
    const firstLine = rawMessage.split("\r\n")[0];

    if (this._isResponse(firstLine)) {
      return this._parseResponse(rawMessage, protocol, responseSocket, rinfo);
    } else {
      return this._parseRequest(rawMessage, protocol, responseSocket, rinfo);
    }
  }

  _isResponse(firstLine) {
    const responsePattern = /^DCP\/\d+\.\d+ \d{3} /; // e.g., "DCP/1.0 200 OK"
    return responsePattern.test(firstLine);
  }

  _parseRequest(rawMessage, protocol, responseSocket, rinfo) {
    const lines = rawMessage.split("\r\n");

    const requestLine = lines[0];
    const parts = requestLine.split(" ");
    if (parts.length !== 3) return null;

    let methodOperator = null;
    let requestMethod;
    let requestUri, version;

    const methodIndex = parts[0].indexOf("!");
    if (methodIndex !== -1) {
      methodOperator = parts[0].substring(0, methodIndex);
      requestMethod = parts[0].substring(methodIndex + 1);
    } else {
      requestMethod = parts[0];
    }
    [requestUri, version] = [parts[1], parts[2]];

    const headers = {};
    let lineIndex = 1;
    while (lineIndex < lines.length && lines[lineIndex]) {
      const headerLine = lines[lineIndex];
      const separatorIndex = headerLine.indexOf(":");
      if (separatorIndex === -1) return null;

      const headerName = headerLine.substring(0, separatorIndex).trim();
      const headerValue = headerLine.substring(separatorIndex + 1).trim();
      headers[headerName] = headerValue;
      lineIndex++;
    }

    let body = null;
    if (lineIndex < lines.length - 1) {
      body = lines.slice(lineIndex + 1).join("\r\n");
    }

    return new DCPRequest(
      methodOperator,
      requestMethod,
      requestUri,
      version,
      protocol,
      headers,
      body
    );
  }

  _parseResponse(rawMessage, protocol, responseSocket, rinfo) {
    const lines = rawMessage.split("\r\n");

    const statusLine = lines[0];
    const statusParts = statusLine.split(" ");
    if (statusParts.length < 3) return null;

    const version = statusParts[0];
    const statusCode = parseInt(statusParts[1], 10);
    const statusMessage = statusParts.slice(2).join(" ");

    const headers = {};
    let lineIndex = 1;
    while (lineIndex < lines.length && lines[lineIndex]) {
      const headerLine = lines[lineIndex];
      const separatorIndex = headerLine.indexOf(":");
      if (separatorIndex === -1) return null;

      const headerName = headerLine.substring(0, separatorIndex).trim();
      const headerValue = headerLine.substring(separatorIndex + 1).trim();
      headers[headerName] = headerValue;
      lineIndex++;
    }

    let body = null;
    if (lineIndex < lines.length && lines[lineIndex] === "") {
      body = lines.slice(lineIndex + 1).join("\r\n");
    }

    const response = new DCPResponse(protocol, responseSocket, version, rinfo);
    response.setStatus(statusCode, statusMessage);
    for (const [key, value] of Object.entries(headers)) {
      response.setHeader(key, value);
    }

    return response;
  }

  _handleResponse(response) {
    console.log("Received response:", JSON.stringify(response, null, 2));
  }
}

function createNode(id) {
  return new DCPNode(id);
}

module.exports = DCPNode;
