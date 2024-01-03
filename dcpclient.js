const net = require("net");
const DCPRequest = require("./dcprequest");

class DCPClient {
  constructor() {
    this.client = new net.Socket();
    this.isConnected = false;
  }

  connect(host, port) {
    return new Promise((resolve, reject) => {
      this.client.connect(port, host, () => {
        this.isConnected = true;
        resolve();
      });

      this.client.on("error", (error) => {
        reject(error);
      });

      this.client.on("end", () => {
        console.log("Disconnected from the server");
        this.isConnected = false;
      });
    });
  }

  request({
    methodOperator = null,
    requestMethod,
    requestUri,
    version = "DCP/1.0",
    headers = {},
    body = null,
  }) {
    return new DCPRequest(
      methodOperator,
      requestMethod,
      requestUri,
      version,
      headers,
      body
    );
  }

  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not connected to server"));
        return;
      }

      const requestString = request.getFormattedRequest();
      this.client.write(requestString);

      this.client.once("data", (data) => {
        resolve(data.toString());
      });

      this.client.once("error", (error) => {
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.isConnected) {
      this.client.end();
      this.isConnected = false;
    }
  }
}

module.exports = DCPClient;
