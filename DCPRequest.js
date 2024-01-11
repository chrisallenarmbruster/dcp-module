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
    this.requestUri = requestUri;
    this.version = version;
    this.protocol = protocol;
    this.headers = headers;
    this.body = body;
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  getHeader(name) {
    return this.headers[name];
  }

  setBody(body) {
    this.body = body;
  }

  removeHeader(name) {
    delete this.headers[name];
  }

  getFormattedMessage() {
    let requestLine = `${this.requestMethod} ${this.requestUri} ${this.version}\r\n`;
    if (this.methodOperator) {
      requestLine = `${this.methodOperator}!` + requestLine;
    }

    let headers = "";
    for (const [key, value] of Object.entries(this.headers)) {
      headers += `${key}: ${value}\r\n`;
    }

    return `${requestLine}${headers}\r\n${this.body}`;
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
