const { createServer } = require("./dcp");

const dcpServer = createServer((req, res) => {
  if (req.isUDP) {
    console.log(`${req.message}\n`);
    parseAndPrintDCPRequest(req);
    console.log("\n\nUDP messages do not get responses.");
  } else {
    console.log(
      `\n\nReceived formatted TCP request:\n\n${req.getFormattedRequest()} \n\n`
    );
    parseAndPrintDCPRequest(req);
    console.log(
      `\n\nSending TCP response:\n\n${res.version} ${res.statusCode} ${
        res.statusMessage
      }\n\n${JSON.stringify(req)}\n\n`
    );
    res.send(JSON.stringify(req));
    res.end();
  }
});

const parseAndPrintDCPRequest = (req) => {
  console.log(
    `\nParsed request:\n` +
      `methodOperator: ${req.methodOperator}\n` +
      `requestMethod: ${req.requestMethod}\n` +
      `requestUri: ${req.requestUri}\n` +
      `version: ${req.version}\n` +
      `headers: ${JSON.stringify(req.headers)}\n` +
      `body: ${req.body}`
  );
};

dcpServer.listen(3000, () => {
  console.log("DCP Server is listening for TCP and UDP messages on port 3000");
});
