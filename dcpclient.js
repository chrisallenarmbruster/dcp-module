const net = require("net");

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

  sendRequest(requestString) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not connected to server"));
        return;
      }

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
