const { createServer } = require("./dcp");

const dcpServer = createServer((req, res) => {
  console.log(`Received request: ${JSON.stringify(req)}`);

  res.send(JSON.stringify(req));
});

dcpServer.listen(3000, () => {
  console.log("DCP Server running on port 3000");
});
