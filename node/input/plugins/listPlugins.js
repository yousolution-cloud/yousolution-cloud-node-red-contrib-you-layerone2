process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const Support = require('../../../utils/reqengine');
const { VerifyErrorLayerOneSL } = require('../../../utils/manageErrorLayerOneSL');
module.exports = function (RED) {
  function ListPluginsNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      try {
        let options = { setup : 'LIST', data: {}};
        let result = await Support.Plugins(node, msg, config, options);
        msg.payload = VerifyErrorLayerOneSL(node, msg , result.data);
        msg.nextLink = result.data['odata.nextLink'] || result.data['@odata.nextLink'];
        msg.statusCode = result.status;
        if(msg.payload) {
          node.status({ fill: 'green', shape: 'dot', text: 'success' });
          node.send(msg);
        }

      } catch (error) {
        msg.payload = error;
        node.status({ fill: 'red', shape: 'dot', text: 'Error' });
        node.error( error , msg );
      }
    });
  }
  RED.nodes.registerType('you-layerone2-plugins-list', ListPluginsNode, {});
};
