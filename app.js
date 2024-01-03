const { createServer } = require("./dcp");

const dcpServer = createServer((req, res) => {
  console.log(`Received request: ${req.requestMethod} ${req.dcpRequestUri}`);
  res.send(JSON.stringify(req));
  res.end();
});

dcpServer.listen(3000, () => {
  console.log("DCP Server is running on port 3000");
});
