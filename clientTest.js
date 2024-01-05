const { createClient } = require("./dcp");

const client = createClient();

async function makeRequest() {
  try {
    const req = client.request({
      methodOperator: "CANCEL",
      requestMethod: "GET",
      requestUri: "DCP://dcp.domain.com/Security.Reset()",
      headers: { "Content-Type": "application/json" },
      body: "Hello, World!",
    });

    req.setHeader("Content-Length", req.body.length);

    await client.connectTCP("localhost", 3000);
    console.log("Connected to the DCP TCP Service");
    const response = await client.sendRequest(req); //
    console.log(
      `\nSending formatted request over TCP:\n\n${req.getFormattedRequest()}\n\n\nResponse from TCP server:\n\n${response}`
    );

    client.disconnectTCP();

    await client.connectUDP("localhost", 3000);
    console.log("\n\nConnected to DCP UDP Service");

    req.requestUri = "DCPU://dcp.domain.com/Security.Reset()";
    const udpResponse = await client.sendRequest(req);
    console.log(
      `\n\nSending formatted request over UDP:\n\n${req.getFormattedRequest()}\n\n\n${udpResponse}\n\nUDP messages do not get responses.\n`
    );

    client.disconnectUDP();
  } catch (error) {
    console.error("Error:", error);
  }
}

makeRequest();
