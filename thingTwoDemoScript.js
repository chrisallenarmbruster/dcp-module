// This is meant to be used with the thingOneDemoScript.js script
// Start thingTwoDemoScript.js first in it's own terminal,
// then run thingOneDemoScript.js in a separate terminal.
// You will see the two scripts communicate with each other.
// Thing 1 will send a request to Thing 2.
// Then Thing 2 will run a request handler and respond to Thing 1.
// Thing 1 will then run a response handler that prints the response to the console.
// Note the constant immediately below - LISTEN_PORT must match the THING_TWO_PORT value in thingOneDemoScript.js.

const dcpNode = require("./dcp").createNode("thing2");
const LISTEN_PORT = 2501; //Must match the THING_TWO_PORT value in thingOneDemoScript.js

// Set up listener and request handler callback for incoming DCP requests
dcpNode.listen(LISTEN_PORT, (req, res) => {
  console.log(
    `\n\nReceived formatted ${
      req.protocol
    } request:\n\n${req.getFormattedMessage()}\n`
  );
  console.log("req.body:", req.body);
  console.log("typeof req.body:", typeof req.body);
  res.setBody("Test Message");
  console.log(`\nParsed into Request Object:\n${JSON.stringify(req, null, 2)}`);
  console.log(`\nPrepared Response Object:\n${JSON.stringify(res, null, 2)}`);
  console.log(
    `\n\nSending formatted ${
      req.protocol
    } response:\n\n${res.getFormattedMessage()}`
  );
  res.send();
});
