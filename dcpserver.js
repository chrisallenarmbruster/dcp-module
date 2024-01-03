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
