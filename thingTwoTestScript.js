const dcpNode = require("./dcp").createNode("thing2");
const LISTEN_PORT = 2501;

// Set up listener and request handler callback for incoming DCP requests
dcpNode.listen(LISTEN_PORT, (req, res) => {
  console.log(
    `\n\nReceived formatted ${
      req.protocol
    } request:\n\n${req.getFormattedMessage()}\n`
  );
  res.setBody("Hello back at you!");
  console.log(`\nParsed into Request Object:\n${JSON.stringify(req, null, 2)}`);
  console.log(`\nPrepared Response Object:\n${JSON.stringify(res, null, 2)}`);
  console.log(
    `\n\nSending formatted ${
      req.protocol
    } response:\n\n${res.getFormattedMessage()}`
  );
  res.send();
});
