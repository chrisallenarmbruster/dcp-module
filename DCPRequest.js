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

  removeHeader(name) {
    delete this.headers[name];
  }

  getFormattedRequest() {
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
}

module.exports = DCPRequest;