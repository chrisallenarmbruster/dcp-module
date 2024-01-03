const net = require("net");

class DCPServer {
  constructor(requestHandler) {
    this.server = net.createServer((socket) => {
      socket.on("data", (data) => {
        const dcpRequest = this.parseDCPRequest(data.toString());
        if (!dcpRequest) {
          // Handle invalid request
          socket.end("Invalid DCP Request");
          return;
        }

        const dcpResponse = new DCPResponse(socket);
        requestHandler(dcpRequest, dcpResponse);
      });

      socket.on("error", (error) => {
        console.error("Socket Error:", error);
      });

      socket.on("end", () => {
        // Handle socket end event
      });
    });

    this.server.on("error", (error) => {
      console.error("Server Error:", error);
    });

    this.server.on("close", () => {
      console.log("Server Closed");
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

        this.server.listen(...args).on("error", reject);
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
    this.server.close(callback);
  }

  parseDCPRequest(requestString) {
    // Split the request string into lines
    const lines = requestString.split("\r\n");

    // Parse the request line
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

    // Parse headers
    const headers = {};
    let lineIndex = 1;
    while (lineIndex < lines.length && lines[lineIndex]) {
      const headerLine = lines[lineIndex];
      const separatorIndex = headerLine.indexOf(":");
      if (separatorIndex === -1) return null; // Invalid header line

      const headerName = headerLine.substring(0, separatorIndex).trim();
      const headerValue = headerLine.substring(separatorIndex + 1).trim();
      headers[headerName] = headerValue;
      lineIndex++;
    }

    // Parse body (optional)
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

class DCPRequest {
  constructor(
    methodOperator,
    requestMethod,
    requestUri,
    version,
    headers,
    body
  ) {
    this.methodOperator = methodOperator;
    this.requestMethod = requestMethod;
    this.requestUri = requestUri;
    this.version = version;
    this.headers = headers;
    this.body = body;
  }
}

class DCPResponse {
  constructor(socket) {
    this.socket = socket;
  }

  send(responseData) {
    this.socket.write(responseData);
  }

  end() {
    this.socket.end();
  }
}

module.exports = DCPServer;
