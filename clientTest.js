const { createClient } = require("./dcp");

const client = createClient();

async function makeRequest() {
  try {
    // Connect to TCP server
    await client.connectTCP("localhost", 3000);
    console.log("Connected to TCP DCP Server");

    const req = client.request({
      methodOperator: "CANCEL",
      requestMethod: "GET",
      requestUri: "DCP://dcp.domain.com/Security.Reset()",
      headers: { "Content-Type": "application/json" },
      body: "Hello, World!",
    });

    req.setHeader("Content-Length", req.body.length);

    const response = await client.sendRequest(req); //
    console.log(
      "\n\nSending formatted request over TCP:\n\n",
      req.getFormattedRequest(),
      "\n\n"
    );
    console.log("Response from TCP server:\n", response);

    client.disconnectTCP();
    /*
    // Connect to UDP server
    await client.connectUDP("localhost", 3000);
    console.log("Connected to UDP DCP Server");

    // Send a request over UDP (similar to TCP, no need to specify protocol)
    const udpResponse = await client.sendRequest(req);
    console.log(
      "\n\nSending formatted request over UDP:\n\n",
      // req.getFormattedRequest(),
      "\n\n"
    );
    // console.log("Response from UDP server:\n", udpResponse);
    console.log("Response from UDP server:\n");

    client.disconnectUDP(); // Disconnect from UDP server
    */
  } catch (error) {
    console.error("Error:", error);
  }
}

makeRequest();
