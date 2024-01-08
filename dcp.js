const DCPNode = require("./DCPNode.js");

function createNode(id) {
  return new DCPNode(id);
}

module.exports.createNode = createNode;
