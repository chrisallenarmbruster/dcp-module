class DCPResponse {
  constructor(socket, version) {
    this.socket = socket;
    this.version = version;
    this.headers = {};
    this.statusCode = 200;
    this.statusMessage = "OK";
  }

  setStatus(code, message) {
    this.statusCode = code;
    this.statusMessage = message;
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  send(body) {
    let responseString = `${this.version} ${this.statusCode} ${this.statusMessage}\r\n`;
    for (const [key, value] of Object.entries(this.headers)) {
      responseString += `${key}: ${value}\r\n`;
    }
    responseString += `\r\n${body}`;

    this.socket.write(responseString);
  }

  end() {
    this.socket.end();
  }
}

module.exports = DCPResponse;
