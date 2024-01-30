const dgram = require("dgram");
const net = require("net");
const DCPRequest = require("./DCPRequest.js");
const DCPResponse = require("./DCPResponse.js");

class DCPNode {
  constructor(id) {
    this.id = id;
    this.listenPort = 2500;
    this.messageHandler = null;
    this.responseHandlers = new Map();
    this.defaultResponseHandler = (response) => {
      console.log("Default handler received response:", response);
    };
    this.defaultTimeout = 30000;
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
    const request = new DCPRequest(
      methodOperator,
      requestMethod,
      requestUri,
      version,
      protocol,
      headers,
      body
    );
    request.setHeader("listen-port", this.listenPort);

    return request;
  }

  async sendMessage(
    message,
    targetIpAddress,
    targetPort,
    protocol,
    responseHandler = null,
    timeout = null
  ) {
    if (!message.getHeader("listen-port")) {
      message.setHeader("listen-port", this.listenPort);
    }
    if (message instanceof DCPRequest) {
      if (!message.getHeader("transaction-id")) {
        message.setTransactionId();
      }
      if (responseHandler) {
        this.responseHandlers.set(
          message.getHeader("transaction-id"),
          responseHandler
        );

        setTimeout(() => {
          this.responseHandlers.delete(message.getHeader("transaction-id"));
        }, timeout || this.defaultTimeout);
      }
    }

    if (protocol === "TCP") {
      return await this._sendTCPMessage(message, targetIpAddress, targetPort);
    } else if (protocol === "UDP") {
      return this._sendUDPMessage(message, targetIpAddress, targetPort);
    } else {
      console.error("Unsupported protocol");
    }
  }

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
        client.on("data", async (data) => {
          client.end();
          try {
            const response = this._parseResponse(
              data.toString("utf-8"),
              "TCP",
              null,
              null
            );
            const transactionId = message.getHeader("transaction-id");

            const handler =
              this.responseHandlers.get(transactionId) ||
              this.defaultResponseHandler;

            await handler(response);

            if (this.responseHandlers.has(transactionId)) {
              this.responseHandlers.delete(transactionId);
            }

            resolve(response);
          } catch (err) {
            reject(err);
          }
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

  _sendUDPMessage(message, targetIpAddress, targetPort) {
    const formattedMessage = message.getFormattedMessage();
    const messageBuffer = Buffer.from(formattedMessage);

    this.udpServer.send(
      messageBuffer,
      0,
      messageBuffer.length,
      targetPort,
      targetIpAddress,
      (err) => {
        if (err) {
          console.error("UDP Error:", err);
        }
      }
    );
    return "UDP Message Sent";
  }

  listen(listenPort, messageHandler) {
    this.messageHandler = messageHandler;
    this.listenPort = listenPort;
    this._setupUDPServer(this.listenPort);
    this._setupTCPServer(this.listenPort);
  }

  _setupUDPServer(port) {
    this.udpServer = dgram.createSocket("udp4");
    this.udpServer.on("message", (msg, rinfo) => {
      this._handleIncomingMessage(msg.toString(), "UDP", this.udpServer, rinfo);
    });
    this.udpServer.bind(port);
    console.log(`Listening for UDP messages on port ${port}...`);
  }

  _setupTCPServer(port) {
    const tcpServer = net.createServer((socket) => {
      socket.on("data", (data) => {
        this._handleIncomingMessage(data.toString(), "TCP", socket);
      });
    });
    tcpServer.listen(port);
    console.log(`Listening for TCP messages on port ${port}...`);
  }

  _handleIncomingMessage(rawMessage, protocol, responseSocket, rinfo) {
    try {
      const parsedMessage = this._parseMessage(
        rawMessage,
        protocol,
        responseSocket,
        rinfo
      );
      // _handleResponse(response) {
      //   console.log("Received response:", JSON.stringify(response, null, 2));
      // }
      if (parsedMessage instanceof DCPResponse) {
        try {
          const response = parsedMessage;
          const transactionId = response.getHeader("transaction-id");

          const handler =
            this.responseHandlers.get(transactionId) ||
            this.defaultResponseHandler;
          handler(response);

          if (this.responseHandlers.has(transactionId)) {
            this.responseHandlers.delete(transactionId);
          }

          return response;
        } catch (err) {
          reject(err);
        }
      } else if (parsedMessage instanceof DCPRequest) {
        let version = "DCP/1.0";
        const res = new DCPResponse(protocol, responseSocket, version, rinfo);
        res.setHeader(
          "transaction-id",
          parsedMessage.getHeader("transaction-id")
        );
        res.destinationPort = parsedMessage.getHeader("listen-port") || 2500;
        res.setHeader("listen-port", this.listenPort);
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

      const headerName = headerLine
        .substring(0, separatorIndex)
        .trim()
        .toLowerCase();
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

      const headerName = headerLine
        .substring(0, separatorIndex)
        .trim()
        .toLowerCase();
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

    if (body !== null) {
      response.setBody(body);
    }

    return response;
  }
}

function createNode(id) {
  return new DCPNode(id);
}

module.exports = DCPNode;
