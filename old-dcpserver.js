const net = require("net");
const dgram = require("dgram");
const DCPRequest = require("./old-dcprequest.js");
const DCPResponse = require("./old-dcpresponse.js");

class DCPServer {
  constructor(requestHandler) {
    this.tcpServer = net.createServer((socket) => {
      socket.on("data", (data) => {
        const dcpRequest = this.parseDCPRequest(data.toString());
        if (!dcpRequest) {
          const dcpResponse = new DCPResponse(socket, "DCP/1.0");
          dcpResponse.setStatus(400, "Bad Request");
          dcpResponse.send("Invalid DCP Request");
          socket.end("Invalid DCP Request");
          return;
        }

        const dcpResponse = new DCPResponse(socket, dcpRequest.version);
        requestHandler(dcpRequest, dcpResponse);
      });

      socket.on("error", (error) => {
        console.error("Socket Error:", error);
      });

      socket.on("end", () => {
        // Handle socket end event
      });
    });

    this.udpServer = dgram.createSocket("udp4");

    this.udpServer.on("message", (msg, rinfo) => {
      const dcpRequest = this.parseDCPRequest(msg.toString());
      dcpRequest.isUDP = true;
      dcpRequest.message = `Received formatted UDP message from ${rinfo.address}:${rinfo.port}:\n\n${msg}`;
      if (!dcpRequest) {
        console.log("Invalid UDP request");
      } else {
        requestHandler(dcpRequest, null);
      }
    });

    this.tcpServer.on("error", (error) => {
      console.error("TCP Server Error:", error);
    });

    this.udpServer.on("error", (error) => {
      console.error("UDP Server Error:", error);
    });

    this.tcpServer.on("close", () => {
      console.log("TCP Server Closed");
    });

    this.udpServer.on("close", () => {
      console.log("UDP Server Closed");
    });
  }

  async listen(port, host, callback) {
    if (typeof host === "function") {
      callback = host;
      host = undefined;
    }

    try {
      await new Promise((resolve, reject) => {
        const args = host ? [port, host] : [port];
        args.push((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        this.tcpServer.listen(...args).on("error", reject);
        this.udpServer.bind(port, host);
      });

      if (callback) {
        callback();
      }
    } catch (error) {
      console.error("Server failed to start:", error);
      if (callback) {
        callback(error);
      }
    }
  }

  close(callback) {
    this.tcpServer.close(() => {
      this.udpServer.close(callback);
    });
  }

  parseDCPRequest(requestString) {
    const lines = requestString.split("\r\n");

    const requestLine = lines[0];
    const parts = requestLine.split(" ");
    if (parts.length !== 3) return null;

    let methodOperator = null;
    let requestMethod;
    let dcpRequestUri, dcpVersion;

    const methodIndex = parts[0].indexOf("!");
    if (methodIndex !== -1) {
      methodOperator = parts[0].substring(0, methodIndex);
      requestMethod = parts[0].substring(methodIndex + 1);
    } else {
      requestMethod = parts[0];
    }
    [dcpRequestUri, dcpVersion] = [parts[1], parts[2]];

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
      dcpRequestUri,
      dcpVersion,
      headers,
      body
    );
  }
}

module.exports = DCPServer;
