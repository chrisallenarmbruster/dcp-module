const dcpNode = require("./dcp").createNode("thing1");
const LISTEN_PORT = 2500;
const PROTOCOL = "TCP";
const THING_TWO_HOST = "localhost";
const THING_TWO_PORT = 2501;

// Set up listener and request handler callback for incoming DCP requests
dcpNode.listen(LISTEN_PORT, (req, res) => {
  console.log(
    `\n\nReceived formatted ${
      req.protocol
    } request:\n\n${req.getFormattedMessage()}\n`
  );
  console.log(`\nParsed into Request Object:\n${JSON.stringify(req, null, 2)}`);
  console.log(`\nPrepared Response Object:\n${JSON.stringify(res, null, 2)}`);
  res.setBody("TEST RESPONSE MESSAGE BODY");
  console.log(
    `\n\nSending formatted ${
      req.protocol
    } response:\n\n${res.getFormattedMessage()}`
  );
  res.send();
});

// Make a DCP request to "Thing 2" and register a response handler callback
const makeRequest = async () => {
  // Create a DCP request message object
  const req = dcpNode.createRequestMessage(
    "CANCEL",
    "GET",
    "DCP://dcp.domain.com/Security.Reset()",
    "DCP/1.0",
    PROTOCOL,
    { "Content-Type": "application/json" },
    "Hello, World!"
  );

  // Set any additional headers on the request message
  req.setHeader("Content-Length", req.body.length);

  // Optionally, set the a body on the request message (if not passed in constructor)
  req.setBody((req.body += "\nHello, Universe!"));

  console.log(
    `\nPrepared request message object:\n${JSON.stringify(req, null, 2)}`
  );

  console.log(
    `\n\nSending formatted DCP request message over ${
      req.protocol
    }:\n\n${req.getFormattedMessage()}\n`
  );

  // Send the request message and register a response handler callback
  const response = await dcpNode.sendMessage(
    req,
    THING_TWO_HOST,
    THING_TWO_PORT,
    req.protocol,
    (res) => {
      console.log(
        `\n\nReceived formatted DCP response:\n\n${res.getFormattedMessage()}`
      );
      console.log(
        `\nParsed into Response Object:\n${JSON.stringify(res, null, 2)}`
      );
      console.log(
        `\nCalled response handler for transaction-id ${res.getHeader(
          "TRANSACTION-ID"
        )}...`
      );
      console.log(
        `\nBooyah! I am the last command in the response handler you registered. S'up?\n`
      );
    }
  );
};

makeRequest();
