const { createNode } = require("./dcp");

const dcpNode = createNode("node1");

dcpNode.listen(3000, (req, res) => {
  console.log(
    `\n\nReceived formatted ${
      req.protocol
    } request:\n\n${req.getFormattedMessage()} \n\n`
  );
  parseAndPrintDCPRequest(req);
  console.log(
    `\n\nSending ${req.protocol} response:\n\n${res.version} ${
      res.statusCode
    } ${res.statusMessage}\n\n${JSON.stringify(req)}\n\n`
  );
  console.log(req);
  res.send(JSON.stringify(req));
  // res.end();
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
