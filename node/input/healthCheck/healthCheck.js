

const { HealthCheck } = require('../../../utils/reqengine');

module.exports = function (RED) {
    function LayerOne2HealthCheck(config) {
        RED.nodes.createNode(this, config);
        this.layerone = config.layerone;
        const node = this;
        node.status({}); 
        node.on('input', async function (msg) {
            let conf = RED.nodes.getNode(node.layerone).options
            try {
                const result = await HealthCheck(node, conf, conf.databaseName);
                msg.payload = result.data;
                node.send({...msg, healthCheck: result.data });
                node.status({ fill: 'green', shape: 'dot', text: 'connected' });
            }
            catch (error) {
                msg.payload = error;
                if (error.response && error.response.data) {
                    msg.statusCode = error.response.status;
                    msg.payload = error.response.data.result;
                }
                node.error(error, msg);
                node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
            }
        }
        )
    }
    RED.nodes.registerType("you-layerone2-health-check", LayerOne2HealthCheck);
}