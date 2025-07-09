process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const Support = require('../../../utils/reqengine');
const entities = require('../../../utils/resources/entities.json');
const { VerifyErrorLayerOneSL } = require('../../../utils/manageErrorLayerOneSL');
module.exports = function (RED) {
  function ManipulateEntitySap(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      // reset status
      node.status({});
      try {
        const data = msg[config.bodyPost];
        const options = { method: 'POST', hasRawQuery: false, hasEntityId: true, isManipulate: true, data: data };
        const login = Support.login;
        const result = await Support.sendRequest({ node, msg, config, axios, login, options });
        msg.payload = VerifyErrorLayerOneSL(node, msg, result.data, true);
        msg.statusCode = result.status;
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
        node.send(msg);
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: 'Error' });
        done(error);
      }
    });
  }

  RED.httpAdmin.get('/entities', RED.auth.needsPermission('you-layerone2-sl-manipulate-entity.read'), (req, res) => {
    //console.log('entities');
    res.json(entities);
  });
  RED.nodes.registerType('you-layerone2-sl-manipulate-entity', ManipulateEntitySap, {});
};
