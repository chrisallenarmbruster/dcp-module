const DCPUri = require("./DCPUri.js");

class DCPRequest {
  constructor(
    methodOperator,
    requestMethod,
    requestUri,
    version,
    protocol,
    headers = {},
    body = ""
  ) {
    this.methodOperator = methodOperator;
    this.requestMethod = requestMethod;
    console.log("requestUri", requestUri);
    this.requestUri =
      requestUri instanceof DCPUri ? requestUri : new DCPUri(requestUri);
    this.version = version;
    this.protocol = protocol;
    this.body = body;

    this.headers = {};
    for (const [key, value] of Object.entries(headers)) {
      this.headers[key.toLowerCase()] = value;
    }
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

  removeHeader(name) {
    delete this.headers[name.toLowerCase()];
  }

  getFormattedMessage() {
    let requestLine = `${this.requestMethod} ${this.requestUri.uriString} ${this.version}\r\n`;
    if (this.methodOperator) {
      requestLine = `${this.methodOperator}!` + requestLine;
    }

    let headers = "";
    for (const [key, value] of Object.entries(this.headers)) {
      headers += `${key.toLowerCase()}: ${value}\r\n`;
    }

    let formattedBody = this.body;
    if (
      typeof this.body === "object" &&
      this.getHeader("content-type") === "application/json"
    ) {
      formattedBody = JSON.stringify(this.body);
    }

    return `${requestLine}${headers}\r\n${formattedBody}`;
  }

  _generateTransactionId() {
    const timestamp = Date.now();
    const randomComponent = Math.floor(Math.random() * 1000000);
    return `${timestamp}-${randomComponent}`;
  }

  setTransactionId(transactionId = null) {
    const id = transactionId || this._generateTransactionId();
    this.setHeader("TRANSACTION-ID", id);
  }
}

module.exports = DCPRequest;
