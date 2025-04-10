process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const Support = require('../../../utils/reqengine');
const { VerifyErrorLayerOneSL } = require('../../../utils/manageErrorLayerOneSL');
module.exports = function (RED) {
  function QueryAdonetNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      try {
        let options = { setup : 'QUERY'};
        config.query = msg[config.queryvalue];
        let result = await Support.AdoNetQuery(node, msg, config, options)
        .catch((err) => {
          return {
            ...err.response,
            data: {
              success: false,
              ...err.response.data,
            }
          };
        });
        console.log(result.data);

        if(config.manageError) {
          msg.payload = VerifyErrorLayerOneSL(node, msg , result.data);
          msg.nextLink = result.data['odata.nextLink'] || result.data['@odata.nextLink'];
          msg.statusCode = result.status;
          if(msg.payload) {
            node.status({ fill: 'green', shape: 'dot', text: 'success' });
            node.send(msg);
          }
        }
        else {
          msg.payload = result.data;
          msg.nextLink = result.data['odata.nextLink'] || result.data['@odata.nextLink'];
          msg.statusCode = result.status;
          node.status({ fill: 'gray', shape: 'dot', text: 'Response Request' });
          node.send(msg);
        }
      } catch (error) {
        msg.payload = error;
        node.status({ fill: 'red', shape: 'dot', text: 'Error' });
        node.error( error , msg );
      }
    });
  }
  RED.nodes.registerType('you-layerone2-adonet-query', QueryAdonetNode, {});
};
