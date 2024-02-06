class DCPUri {
  constructor(scheme, host, port, objectPath) {
    this.uriString = null;
    this.scheme = null;
    this.host = null;
    this.port = null;
    this.objectPath = null;
    this.error = null;

    if (typeof scheme === "string" && arguments.length === 1) {
      this.uriString = scheme;
      this.parseFromString(scheme);
    } else if (
      typeof scheme === "object" &&
      scheme !== null &&
      arguments.length === 1
    ) {
      this.scheme = scheme.scheme || null;
      this.host = scheme.host || null;
      this.port = scheme.port || null;
      this.objectPath = scheme.objectPath
        ? scheme.objectPath.replace(/\//g, ".")
        : null;
      this.constructUriString();
    } else {
      this.scheme = scheme || null;
      this.host = host || null;
      this.port = port || null;
      this.objectPath = objectPath ? objectPath.replace(/\//g, ".") : null;
      this.constructUriString();
    }
  }

  parseFromString(uri) {
    const dcpSchemePattern = /^(dcp|dcpu|dcps):\/\//i;
    const hostPattern = /^[a-zA-Z0-9.-]+/;
    const portPattern = /:(\d+)/;
    const objectPathPattern = /\/(.*)$/;

    try {
      let remainingUri = uri;
      const schemeMatch = uri.match(dcpSchemePattern);
      if (schemeMatch) {
        this.scheme = schemeMatch[0].slice(0, -3).toLowerCase();
        remainingUri = uri.replace(dcpSchemePattern, "");
      }

      const hostMatch = remainingUri.match(hostPattern);
      if (hostMatch) {
        this.host = hostMatch[0];
        remainingUri = remainingUri.replace(hostPattern, "");
      }

      const portMatch = remainingUri.match(portPattern);
      if (portMatch) {
        this.port = parseInt(portMatch[1], 10);
        remainingUri = remainingUri.replace(portPattern, "");
      }

      const objectPathMatch = remainingUri.match(objectPathPattern);
      if (objectPathMatch) {
        this.objectPath = objectPathMatch[1].replace(/\//g, ".");
      } else if (remainingUri !== "") {
        throw new Error("Invalid object path.");
      }
    } catch (error) {
      this.error = error.message;
    }
  }

  constructUriString() {
    this.uriString = `${this.scheme ? this.scheme + "://" : ""}${
      this.host || ""
    }${this.port ? ":" + this.port : ""}${
      this.objectPath ? "/" + this.objectPath.replace(/\./g, "/") : ""
    }`;
  }
}

module.exports = DCPUri;
