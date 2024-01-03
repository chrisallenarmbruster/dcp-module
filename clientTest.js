const { createClient } = require("./dcp");

const client = createClient();

async function makeRequest() {
  try {
    await client.connect("localhost", 3000);
    console.log("Connected to DCP Server");

    const req = client.request({
      methodOperator: "CANCEL",
      requestMethod: "GET",
      requestUri: "DCP://dcp.domain.com/Security.Reset()",
      headers: { "Content-Type": "application/json" },
      body: "Hello, World!",
    });

    req.setHeader("Content-Length", req.body.length);

    const response = await client.sendRequest(req);
    console.log(
      "\n\nSending formatted request:\n",
      req.getFormattedRequest(),
      "\n\n"
    );
    console.log("Response from server:\n", response);

    client.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

makeRequest();
