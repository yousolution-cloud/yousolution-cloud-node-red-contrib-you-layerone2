

const { PREFIXNAME, login} = require('../../../utils/reqengine');
const { v4 } = require('uuid');

module.exports = function(RED) {
    function LayerOne2Auth(config) {
        RED.nodes.createNode(this, config);
        this.layeroneConfigs = config.layerone;
        this.Configs = RED.nodes.getNode(this.layeroneConfigs);
        const node = this;

        node.status({}); // Reset Status
        const EXPIRED_TIME = 60; // minutes
        const globalContext = node.context().global;
        let globalName= "";

        if (!node.layeroneConfigs) {
            node.status({ fill: 'gray', shape: 'ring', text: 'Missing credentials' });
        }
    
        node.on('input', async function(msg)
        {
            try {
                
                if(config.entity == "Static" || config.entity == "") {
                    let conf = RED.nodes.getNode(node.layeroneConfigs).options;
                    globalName = `${PREFIXNAME}_CONFIG.${conf.host.replaceAll('.', '')}_${conf.databaseName}_${conf.companyUser}`;
                    let currentDate = new Date();
                    const headers = globalContext.get(`${globalName}.headers`);
                    const exipiredTime = globalContext.get(`${globalName}.exp`);
                    let validToken = true;

                    msg[PREFIXNAME] = {
                        lyc: node.id,
                        layeroneConfigs: node.layeroneConfigs,
                        type: config.entity,
                        dynamics: config.entitydynamics,
                        id: globalName,
                    }

                    globalContext.set(`${globalName}.layeroneConfigs`, node.layeroneConfigs); 
                    globalContext.set(`${globalName}.configs`, conf);

                    if(headers && exipiredTime) {
                        let providedDate = new Date(exipiredTime);
                        let timeDifference = currentDate - providedDate;
                        let minutesDifference = timeDifference / (1000 * 60);
                        validToken = minutesDifference > EXPIRED_TIME ? false : true;
                    }


                    if(!headers || !validToken) {
                        try {
                            const result = await login(node , conf, msg[config.headers] || {});
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
                else {
                    if(config.entitydynamics == 'Configs'){
                        

                        if(!msg[config.configsid].hasOwnProperty('config')){
                            throw new Error('Not Read a config props')
                        }

                        let currentDate = new Date();
                        node.layeroneConfigs = msg[config.configsid].config;
                        let conf = RED.nodes.getNode(msg[config.configsid].config).options;

                        globalName = `${PREFIXNAME}_CONFIG.${conf.host.replaceAll('.', '')}_${conf.databaseName}_${conf.companyUser}`;

                        msg[PREFIXNAME] = {
                            lyc: node.id,
                            layeroneConfigs: node.layeroneConfigs,
                            type: config.entity,
                            dynamics: config.entitydynamics,
                            id: globalName,
                        }

                        let headers = globalContext.get(`${globalName}.headers`);
                        const dataset = globalContext.get(`${globalName}.dataset`);
                        let exipiredTime = globalContext.get(`${globalName}.exp`);
                        let validToken = true;

                        if(dataset) {
                            if(dataset.DatabaseName != conf.databaseName || dataset.CompanyUser != conf.companyUser){
                                headers = undefined;
                                validToken = undefined;
                            }
                        }

                        globalContext.set(`${globalName}.layeroneConfigs`, msg[config.configsid].config); 
                        globalContext.set(`${globalName}.configs`, conf);

                        if(headers && exipiredTime) {
                            let providedDate = new Date(exipiredTime);
                            let timeDifference = currentDate - providedDate;
                            let minutesDifference = timeDifference / (1000 * 60);
                            validToken = minutesDifference > EXPIRED_TIME ? false : true;
                        }

                        if(!headers || !validToken) {
                            try {
                                const result = await login(node , conf,  msg[config.headers] || {});
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
                    else if(config.entitydynamics == 'Params'){
                        let params = msg[config.paramsprops];

                        if(!params) {
                            node.status({ fill: 'red', shape: 'dot', text: 'not set params' });
                            node.error('not set params', msg);
                            return;
                        }

                        globalName = `${PREFIXNAME}_PARAMS.${params.host.replaceAll('.', '')}_${params.databaseName}_${params.companyUser}`;

                        let dynamicsConfigs = globalContext.get(globalName);

                        if(!dynamicsConfigs) {
                            dynamicsConfigs = {
                                    id: v4(),
                                    configs: {
                                        ...params,
                                        companyPassword: undefined
                                    },
                                    host: params.host || "",
                                    databaseName: params.databaseName,
                                    companyUser: params.companyUser
                            };
                            globalContext.set(globalName, dynamicsConfigs);
                        }

                        msg[PREFIXNAME] = {
                            lyc: node.id,
                            layeroneConfigs: "ND",
                            type: config.entity,
                            dynamics: config.entitydynamics,
                            id: globalName,
                        }
                        let currentDate = new Date();
                        let headers = globalContext.get(`${globalName}.headers`);
                        const dataset = globalContext.get(`${globalName}.dataset`);
                        let exipiredTime = globalContext.get(`${globalName}.exp`);
                        let validToken = true;

                        if(dataset) {
                            if(dataset.DatabaseName != params.databaseName || dataset.CompanyUser != params.companyUser){
                                headers = undefined;
                                validToken = undefined;
                            }
                        }

                        globalContext.set(`${globalName}.layeroneConfigs`, params); 
                        globalContext.set(`${globalName}.configs`, params);

                        if(headers && exipiredTime) {
                            let providedDate = new Date(exipiredTime);
                            let timeDifference = currentDate - providedDate;
                            let minutesDifference = timeDifference / (1000 * 60);
                            validToken = minutesDifference > EXPIRED_TIME ? false : true;
                        }

                        if(!headers || !validToken) {
                            try {
                                const result = await login(node , params,  msg[config.headers] || {});
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
                    else {
                        node.status({ fill: 'gray', shape: 'ring', text: 'Missing Dynamics Login' });
                    }
                }
            
            }
            catch (e){
                node.error( e , msg);
                node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
            }
           

        }
    )
    }
    RED.nodes.registerType("you-layerone2-auth",LayerOne2Auth);
}