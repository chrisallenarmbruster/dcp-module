const { createClient } = require("./dcp");

const dcpClient = createClient();

dcpClient.connect("localhost", 3000, () => {
  console.log("Connected to DCP server");

  const dcpRequest =
    "CANCEL!GET DCP://dcp.domain.com/Security.Reset() DCP/1.0\r\n";
  dcpClient.sendRequest(dcpRequest, (response) => {
    console.log("Received response:", response);
    dcpClient.disconnect();
  });
});
