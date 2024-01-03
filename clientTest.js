const { createClient } = require("./dcp");

const client = createClient();

async function makeRequest() {
  try {
    await client.connect("localhost", 3000);
    console.log("Connected to DCP Server");

    // const requestBody = JSON.stringify({ action: "reset" });
    const requestBody = "Hello, World!";
    const request =
      "CANCEL!GET DCP://dcp.domain.com/Security.Reset() DCP/1.0\r\n" +
      "Content-Type: application/json\r\n" +
      "Content-Length: " +
      Buffer.byteLength(requestBody) +
      "\r\n" +
      "\r\n" +
      requestBody;

    const response = await client.sendRequest(request);
    console.log("Response from server:\n", response);

    client.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

makeRequest();
