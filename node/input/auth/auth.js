

const { PREFIXNAME, login} = require('../../../utils/reqengine');

module.exports = function(RED) {
    function LayerOne2Auth(config) {
        RED.nodes.createNode(this, config);
        this.layeroneConfigs = config.layerone;
        this.Configs = RED.nodes.getNode(this.layeroneConfigs);
        const node = this;

        node.status({}); // Reset Status
        const globalContext = node.context().global;
        let globalName = `${PREFIXNAME}_${node.id}`;
        globalContext.set(globalName, {
                id: node.id,
                layeroneConfigs: node.layeroneConfigs,
                configs: node.Configs,
        });
    
        if (!node.layeroneConfigs) {
            node.status({ fill: 'gray', shape: 'ring', text: 'Missing credentials' });
        }
    
        node.on('input', async function(msg)
        {
            let currentDate = new Date();
            const headers = globalContext.get(`${globalName}.headers`);
            const exipiredTime = globalContext.get(`${globalName}.exp`);
            let validToken = true;

            msg[PREFIXNAME] = {
                lyc: node.id,
                layeroneConfigs: node.layeroneConfigs
            }

            let conf = RED.nodes.getNode(node.layeroneConfigs).options;
            globalContext.set(`${globalName}.layeroneConfigs`, node.layeroneConfigs); 
            globalContext.set(`${globalName}.configs`, conf);

            if(headers && exipiredTime) {
                let providedDate = new Date(exipiredTime);
                let timeDifference = currentDate - providedDate;
                let minutesDifference = timeDifference / (1000 * 60);
                validToken = minutesDifference > 25 ? false : true;
            }


            if(!headers || !validToken) {
                try {
                    const result = await login(node , conf);
                    if(result.data.hasOwnProperty("error")) {
                        node.error( result.data.error , msg);
                        node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
                      }
                      else {
                        globalContext.set(`${globalName}.headers`, { Authorization: `Bearer ${result.data.AuthenticationToken}`});
                        globalContext.set(`${globalName}.dataset`, result.data);
                        globalContext.set(`${globalName}.exp`, currentDate.toISOString());
                        node.send(msg);
                        node.status({ fill: 'green', shape: 'dot', text: 'connected' });
                      }
                }
                catch (error) {
                    msg.payload = error;
                    if (error.response && error.response.data) {
                        msg.statusCode = error.response.status;
                        msg.payload = error.response.data.result;
                    }
                    node.error( error , msg);
                    node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
                }
            }
            else {
                node.status({ fill: 'green', shape: 'dot', text: 'connected' });
                node.send(msg);
            }

        }
    )
    }
    RED.nodes.registerType("you-layerone2-auth",LayerOne2Auth);
}