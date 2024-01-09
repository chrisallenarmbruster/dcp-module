const dcpNode = require("./dcp").createNode("node1");

const makeRequest = async () => {
  try {
    const req = dcpNode.createRequestMessage(
      "CANCEL",
      "GET",
      "DCP://dcp.domain.com/Security.Reset()",
      "DCP/1.0",
      "TCP",
      { "Content-Type": "application/json" },
      "Hello, World!"
    );

    req.setHeader("Content-Length", req.body.length);

    const response = await dcpNode.sendMessage(
      req,
      "localhost",
      3000,
      "TCP",
      (res) => {
        console.log("\nBooyah!\n");
        console.log(res);
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

makeRequest();
