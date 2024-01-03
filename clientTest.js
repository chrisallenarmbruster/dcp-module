const { createClient } = require("./dcp");

const client = createClient();

async function makeRequest() {
  try {
    await client.connect("localhost", 3000);
    console.log("Connected to DCP Server");

    const response = await client.sendRequest(
      "CANCEL!GET DCP://dcp.domain.com/Security.Reset() DCP/1.0\r\n"
    );
    console.log("Response from server:\n", response);

    client.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

makeRequest();
