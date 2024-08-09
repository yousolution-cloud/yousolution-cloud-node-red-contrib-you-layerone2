module.exports = function (RED) {
    function AdoNextLinkNode(config) {
      RED.nodes.createNode(this, config);
      const node = this;
  
      node.on('input', async (msg) => {
        const nextLink = msg["nextLink"];
  
        if (!nextLink) {
          node.send([null, msg]);
          return;
        }
  
        node.send([msg, null]);
      });
    }
    RED.nodes.registerType('you-layerone2-adonet-next-link', AdoNextLinkNode, {});
  };
  