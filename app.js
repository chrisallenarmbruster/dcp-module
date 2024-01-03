const { createServer } = require("./dcp");

const dcpServer = createServer((req, res) => {
  console.log(
    `\nReceived request:\n` +
      `methodOperator: ${req.methodOperator}\n` +
      `requestMethod: ${req.requestMethod}\n` +
      `requestUri: ${req.requestUri}\n` +
      `version: ${req.version}\n` +
      `headers: ${JSON.stringify(req.headers)}\n` +
      `body: ${req.body}`
  );
  res.send(JSON.stringify(req));
  res.end();
});

dcpServer.listen(3000, () => {
  console.log("DCP Server is running on port 3000");
});
