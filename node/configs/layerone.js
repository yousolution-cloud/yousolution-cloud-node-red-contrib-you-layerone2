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
        }
    }

    RED.nodes.registerType('you-layerone2', LayerOne2ConfigsNode);
}