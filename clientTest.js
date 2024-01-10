const PROTOCOL = "TCP";

const dcpNode = require("./dcp").createNode("node1");

// Set up listener and request handler callback for incoming DCP requests
dcpNode.listen(3000, (req, res) => {
  console.log(
    `\n\nReceived formatted ${
      req.protocol
    } request:\n\n${req.getFormattedMessage()} \n\n`
  );

  console.log(req);
  console.log(`\n\nSending ${req.protocol} response:\n\n`);
  console.log(res);
  res.send("TEST RESPONSE MESSAGE BODY");
  // res.end();
});

const makeRequest = async () => {
  // Make a DCP request to the DCP server and register a response handler callback
  try {
    const req = dcpNode.createRequestMessage(
      "CANCEL",
      "GET",
      "DCP://dcp.domain.com/Security.Reset()",
      "DCP/1.0",
      PROTOCOL,
      { "Content-Type": "application/json" },
      "Hello, World!"
    );

    req.setHeader("Content-Length", req.body.length);

    console.log(`\nSending initial DCP request message over ${req.protocol}:`);
    const response = await dcpNode.sendMessage(
      req,
      "localhost",
      3000,
      req.protocol,
      (res) => {
        console.log(
          `\nBooyah! I received the response and called the response handler for transaction-id ${res.getHeader(
            "TRANSACTION-ID"
          )}.  The response handler printed this line.\n`
        );
        console.log(res);
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

makeRequest();
