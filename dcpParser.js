function parseDcpRequestUri(uri) {
  const dcpSchemePattern = /^(dcp|dcpu|dcps):\/\//i;
  const hostPattern = /^[a-zA-Z0-9.-]+/;
  const portPattern = /:(\d+)/;
  const objectPathPattern =
    /\/(\*?[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*(\.[a-zA-Z0-9]+(\(.*\))?))?$/;

  let result = {
    scheme: null,
    host: null,
    port: null,
    objectPath: null,
    error: null,
  };

  try {
    const schemeMatch = uri.match(dcpSchemePattern);
    if (schemeMatch) {
      result.scheme = schemeMatch[0].slice(0, -3).toLowerCase(); // Remove '://'
    } else {
      throw new Error("Invalid DCP scheme.");
    }

    let remainingUri = uri.replace(dcpSchemePattern, "");

    const hostMatch = remainingUri.match(hostPattern);
    if (hostMatch) {
      result.host = hostMatch[0];
    } else {
      throw new Error("Invalid host.");
    }

    remainingUri = remainingUri.replace(hostPattern, "");

    const portMatch = remainingUri.match(portPattern);
    if (portMatch) {
      result.port = parseInt(portMatch[1], 10);
      remainingUri = remainingUri.replace(portPattern, "");
    }

    const objectPathMatch = remainingUri.match(objectPathPattern);
    if (objectPathMatch) {
      result.objectPath = objectPathMatch[0].slice(1);
    } else if (remainingUri !== "") {
      throw new Error("Invalid object path.");
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

// Example usage
const uri = "DCP://x10.domain.com:2500/X10.Power(120,60,'one phase')";
const parsedUri = parseDcpRequestUri(uri);
console.log(parsedUri);
