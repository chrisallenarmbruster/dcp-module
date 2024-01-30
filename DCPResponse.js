class DCPResponse {
  constructor(protocol, responseSocket, version, rinfo = null) {
    this.protocol = protocol;
    this.responseSocket = responseSocket;
    this.version = version;
    this.rinfo = rinfo;
    this.destinationPort = null;
    this.statusCode = 200;
    this.statusMessage = "OK";
    this.headers = {};
    this.body = null;
  }

  setStatus(code, message) {
    this.statusCode = code;
    this.statusMessage = message;
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }

  setBody(body) {
    this.body = body;
  }

  async send(body, keepConnectionOpen = false) {
    if (typeof body === "string") {
      this.body = body;
    }

    let response = this.getFormattedMessage();
    if (this.protocol === "TCP") {
      this.responseSocket.write(response, () => {
        if (!keepConnectionOpen) {
          this.responseSocket.end();
        }
      });
    } else if (this.protocol === "UDP" && this.rinfo) {
      const messageBuffer = Buffer.from(response);
      this.responseSocket.send(
        messageBuffer,
        0,
        messageBuffer.length,
        this.destinationPort || this.rinfo.port || 2500,
        this.rinfo.address,
        (err) => {
          if (err) {
            console.error("UDP send error:", err);
          }
        }
      );
    }
  }

  getFormattedMessage() {
    let response = `${this.version} ${this.statusCode} ${this.statusMessage}\r\n`;
    for (const [key, value] of Object.entries(this.headers)) {
      response += `${key.toLowerCase()}: ${value}\r\n`;
    }
    response += `\r\n${this.body}`;
    return response;
  }
}

module.exports = DCPResponse;
