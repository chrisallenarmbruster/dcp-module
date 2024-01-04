const net = require("net");
const dgram = require("dgram");
const DCPRequest = require("./dcprequest");

class DCPClient {
  constructor() {
    this.tcpClient = new net.Socket();
    this.udpClient = dgram.createSocket("udp4");
    this.isConnectedTCP = false;
    this.isConnectedUDP = false;
  }

  connectTCP(host, port) {
    return new Promise((resolve, reject) => {
      this.tcpClient.connect(port, host, () => {
        this.isConnectedTCP = true;
        resolve();
      });

      this.tcpClient.on("error", (error) => {
        reject(error);
      });

      this.tcpClient.on("end", () => {
        console.log("Disconnected from the TCP service");
        this.isConnectedTCP = false;
      });
    });
  }

  connectUDP(host, port) {
    console.log("Connecting to UDP service");
    return new Promise((resolve, reject) => {
      this.udpClient = dgram.createSocket("udp4");

      this.udpClient.on("error", (error) => {
        reject(error);
      });

      this.udpClient.on("close", () => {
        console.log("Disconnected from the UDP service");
        this.isConnectedUDP = false;
      });

      this.udpClient.bind(() => {
        this.udpClient.connect(port, host, () => {
          this.isConnectedUDP = true;
          resolve();
        });
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
      if (this.isConnectedTCP) {
        const requestString = request.getFormattedRequest();
        this.tcpClient.write(requestString);

        this.tcpClient.once("data", (data) => {
          resolve(data.toString());
        });

        this.tcpClient.once("error", (error) => {
          reject(error);
        });
      } else if (this.isConnectedUDP) {
        const requestString = request.getFormattedRequest();
        this.udpClient.send(requestString, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve("UDP request sent successfully");
          }
        });

        this.udpClient.once("error", (error) => {
          reject(error);
        });
      } else {
        reject(new Error("Not connected to any server"));
      }
    });
  }

  disconnectTCP() {
    if (this.isConnectedTCP) {
      this.tcpClient.end();
      this.isConnectedTCP = false;
    }
  }

  disconnectUDP() {
    if (this.isConnectedUDP) {
      this.udpClient.close();
      this.isConnectedUDP = false;
    }
  }

  disconnect() {
    this.disconnectTCP();
    this.disconnectUDP();
  }
}

module.exports = DCPClient;
