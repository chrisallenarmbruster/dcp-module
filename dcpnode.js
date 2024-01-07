class Node {
  constructor(id) {
    this.id = id;
    this.messageHandler = null; // Placeholder for a higher-level handler
  }

  sendMessage(message, targetIpAddress, targetPort, protocol) {
    // Code to send a message
  }

  listen(listenPort, messageHandler) {
    this.messageHandler = messageHandler;
    // Code to start listening for incoming messages
    // When a message is received, pass it to this.messageHandler
  }

  // Internal method to handle incoming messages
  _handleIncomingMessage(rawMessage) {
    if (this.messageHandler) {
      const parsedMessage = this._parseMessage(rawMessage);
      this.messageHandler(parsedMessage);
    } else {
      console.error("Message handler not set");
    }
  }

  _parseMessage(rawMessage) {
    // Parse the raw message and return a structured object
    // This method can be customized to fit your message format
    return {
      /* structured message object */
    };
  }

  // Other methods
}

function createNode(id) {
  return new Node(id);
}

module.exports.createNode = createNode;
