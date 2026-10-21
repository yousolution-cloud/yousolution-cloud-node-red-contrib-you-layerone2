module.exports = function (RED) {
    function AdoNextLinkNode(config) {
      RED.nodes.createNode(this, config);
      const node = this;
  
      node.on('input', async (msg) => {
        let nextLink =msg["nextLink"];

        if(nextLink) {
          const u = new URL(nextLink);
          msg.nextLink = u.search;
        }

        if (!nextLink) {
          node.send([null, msg]);
          return;
        }
  
        node.send([msg, null]);
      });
    }
    RED.nodes.registerType('you-layerone2-adonet-next-link', AdoNextLinkNode, {});
  };
  