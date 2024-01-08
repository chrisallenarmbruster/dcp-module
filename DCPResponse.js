class DCPResponse {
  constructor(protocol, responseSocket, version, rinfo = null) {
    this.protocol = protocol;
    this.responseSocket = responseSocket;
    this.version = version;
    this.headers = {};
    this.rinfo = rinfo;
    this.statusCode = 200;
    this.statusMessage = "OK";
    this.body = null;
  }

  setStatus(code, message) {
    this.statusCode = code;
    this.statusMessage = message;
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  setBody(body) {
    this.body = body;
  }

  send(body, keepConnectionOpen = false) {
    this.body = body;
    const response = this.getFormattedMessage();

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
        this.rinfo.port,
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
      response += `${key}: ${value}\r\n`;
    }
    response += `\r\n${this.body}`;
    return response;
  }
}

module.exports = DCPResponse;
