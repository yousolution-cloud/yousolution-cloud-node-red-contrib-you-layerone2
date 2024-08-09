process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const Support = require('../../../utils/reqengine');
const { v4: uuidv4 } = require('uuid')
const { VerifyErrorLayerOneSL } = require('../../../utils/manageErrorLayerOneSL');
module.exports = function (RED) {
  function JsonBatchNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      try {
        
        config.body =structuredClone(msg[config.bodypost].map((req) => {
            return {
              id: uuidv4(),
              ...req 
            }
          }));

        msg.jsonBatchRequest = structuredClone(config.body); // for post read ID for User
        let result = await Support.JsonBatch(node, msg, config);
        msg.payload = VerifyErrorLayerOneSL(node, msg , result.data);
        msg.statusCode = result.status;
        if(msg.payload) {
            if(msg.payload.hasOwnProperty('responses')){
                msg.payload = msg.payload.responses;
            }


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
  RED.nodes.registerType('you-layerone2-batch-json', JsonBatchNode, {});
};
