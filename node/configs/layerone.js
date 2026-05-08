const { PREFIXNAME } = require('../../utils/reqengine');
module.exports = function (RED)  {
    function LayerOne2ConfigsNode(n) {
        RED.nodes.createNode(this, n);
        this.options = {
            name : n.name || n.id,
            protocol : n.protocol || "",
            host : n.host || "",
            port: n.port, 
            version: n.version,
            databaseName: n.databaseName,
            companyUser: n.companyUser,
            companyPassword: n.companyPassword,
            consumerIdentity: n.consumerIdentity,
            timeOut: n.timeOut,
            headers: n.headers
        }

        if(this.options.timeOut === undefined || this.options.timeOut === null || this.options.timeOut === ""){
            this.options.timeOut = 120000;
        }

        const globalContext = this.context().global;
        let globalName = `${PREFIXNAME}_CONFIG.${n.host.replaceAll('.', '')}_${n.databaseName}_${n.companyUser}`;
        globalContext.set(globalName, {
                id: n.id,
                configs: {
                    options:  {
                        ...this.options,
                        companyPassword: undefined
                    }
                },
                host: n.host || "",
                databaseName: n.databaseName,
                companyUser: n.companyUser
        });
    }

    RED.nodes.registerType('you-layerone2', LayerOne2ConfigsNode);
}