class DCPRequest {
  constructor(
    methodOperator,
    requestMethod,
    requestUri,
    version,
    headers,
    body
  ) {
    this.methodOperator = methodOperator;
    this.requestMethod = requestMethod;
    this.requestUri = requestUri;
    this.version = version;
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
    let requestLine = "";

    if (this.methodOperator) {
      requestLine += `${this.methodOperator}!`;
    }

    requestLine += `${this.requestMethod} ${this.requestUri} ${this.version}\r\n`;

    let headerLines = Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");

    let requestBody = "";
    if (this.body !== null) {
      requestBody = `\r\n${this.body}`;
    }

    return `${requestLine}${headerLines}\r\n${requestBody}`;
  }
}

module.exports = DCPRequest;
