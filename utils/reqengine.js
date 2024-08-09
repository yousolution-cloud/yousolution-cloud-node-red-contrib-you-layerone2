const axios = require("axios");
const buildQuery = require('odata-query').default;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


const PREFIXNAME =  "_YOU_LY2";

const thickIdApi = [
    'AccrualTypes',
    'AssetClasses',
    'AssetDepreciationGroups',
    'AssetGroups',
    'AlternateCatNum',
    'BankChargesAllocationCodes',
    'BusinessPartners',
    'CampaignResponseType',
    'CashDiscounts',
    'ChartOfAccounts',
    'ChooseFromList',
    'ContractTemplates',
    'CostCenterTypes',
    'CostElements',
    'Countries',
    'CreditCardPayments',
    'Currencies',
    'CustomsDeclaration',
    'CycleCountDeterminations',
    'DeductionTaxSubGroups',
    'DepreciationAreas',
    'DepreciationTypePools',
    'DepreciationTypes',
    'DistributionRules',
    'DunningTerms',
    'EmailGroups',
    'EmployeeIDType',
    'FAAccountDeterminations',
    'FactoringIndicators',
    'FiscalPrinter',
    'ItemImages',
    'Items',
    'JournalEntryDocumentTypes',
    'KPIs',
    'LandedCostsCodes',
    'LocalEra',
    'MobileAddOnSetting',
    'NFModels',
    'ProductTrees',
    'ProfitCenters',
    'Projects',
    'Queue',
    'ReportTypes',
    'Resources',
    'SalesTaxCodes',
    'TargetGroups',
    'TaxInvoiceReport',
    'TransactionCodes',
    'UserDefaultGroups',
    'UserObjectsMD',
    'UserPermissionTree',
    'UserTablesMD',
    'VatGroups',
    'Warehouses',
    'WithholdingTaxCodes',
    'WizardPaymentMethods',
    'UDT',
  ];




function buildBaseUrl(layeroneConfigs) {
    return `${layeroneConfigs.protocol.trim()}://${layeroneConfigs.host.trim()}:${layeroneConfigs.port.trim()}/layerone/nth/Lyr/${layeroneConfigs.version.trim()}`
}

function buildBaseUrlSL(layeroneConfigs) {
  return `${layeroneConfigs.protocol.trim()}://${layeroneConfigs.host.trim()}:${layeroneConfigs.port.trim()}/layerone/nth/Lyr`
}

function buildBaseUrlPlugins(layeroneConfigs, pluginName) {
  return `${layeroneConfigs.protocol.trim()}://${layeroneConfigs.host.trim()}:${layeroneConfigs.port.trim()}/layerone/nth/${pluginName.trim()}/${layeroneConfigs.version.trim()}`
}


async function JsonBatch(node, msg, configs){
    let {_, currentelayeroneConfigs , headers } = getSapParams(node, msg);
    let url;
    let baseUrl = buildBaseUrl(currentelayeroneConfigs);
    let data = {
      requests: structuredClone(configs.body.map((req) => {
        return {
          ...req,
          url: `${baseUrl}/${req.url}`,
        }
      }))
    };

    url = `${baseUrl}/$batch`;
    let axiosOptions = {
      method: "POST",
      url: url,
      rejectUnauthorized: false,
      withCredentials: true,
      headers: {...headers, ...msg[configs.headers]},
      data: data  
    };
  
    return await axios(axiosOptions);
}



async function AdoNetQuery(node, msg, configs, options){
  const pluginName = 'adonet'
  let globalContext = node.context().global;
  let {_, currentelayeroneConfigs , headers } = getSapParams(node, msg);
  let url;
  let rawQuery = configs.query;
  let baseUrl = buildBaseUrlPlugins(currentelayeroneConfigs,pluginName);
  let data = {};


  let globalName = `${PREFIXNAME}_${pluginName}_${node.id}`;
  if(options.setup == 'QUERY') {
    if(rawQuery && !msg["nextLink"]) {
      url = `${baseUrl}/Query`;
      globalContext.set(globalName,{
        query : rawQuery,
      });


    }
    else {
      url = msg["nextLink"];
        rawQuery = globalContext.get(globalName).query;
    }

    data.query = rawQuery;


  }
  else if (options.setup == 'COMMAND') {
    if(rawQuery && !msg["nextLink"]) {
      url = `${baseUrl}/Command`;
      globalContext.set(globalName,{
        query : rawQuery,
      });

    }
    else {
      url = msg["nextLink"];
        rawQuery = globalContext.get(globalName).query;
    }
    data.query = rawQuery;
  }
  else if(options.setup == 'STORE') {
    if(!configs.storename){
      node.error('Not Set StoredProcedureName', msg);
      return null;
    }

    url = `${baseUrl}/StoredProcedure?storedProcedureName=${configs.storename.trim()}`;
    data = configs.bodypost;
  }

  let axiosOptions = {
    method: "POST",
    url: url,
    rejectUnauthorized: false,
    withCredentials: true,
    headers: {...headers, ...msg[configs.headers]},
    data: data  
  };

  //axiosOptions = { ...axiosOptions,  };
  return await axios(axiosOptions);

}

async function HealthCheck(node, conf ,databaseName) {

    if( !databaseName) {
      node.error('Not Set DB Name', msg);
    }
    let url =  `${buildBaseUrl(conf)}/HealthCheck?databaseName=${databaseName.trim()}`;

    const options = {
      method: 'GET',
      url: url,
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
      },
  };

  return await axios(options);
}


async function Plugins(node, msg, configs, options) {
  const {_, currentelayeroneConfigs , headers } = getSapParams(node, msg);
  let url;
  let rawQuery = configs.query;
  let baseUrl = buildBaseUrl(currentelayeroneConfigs);


  if(options.setup == 'OBJECT') {
    url = `${baseUrl}/Plugins('${configs.code}')`;
  }
  else if(options.setup == 'LIST') {
    let odataNextLink = msg["nextLink"];
    url = `${baseUrl}/Plugins`;
    if (rawQuery && !odataNextLink) {
      const urlOdata = buildQuery(rawQuery);
      msg.odata = urlOdata;
      url = `${url}${urlOdata}`;
    }
  }

  let axiosOptions = {
      method: "GET",
      url: url,
      rejectUnauthorized: false,
      withCredentials: true,
      headers: headers,
    };
  
    if (options.data) {
      axiosOptions = { ...axiosOptions, ...{ data: options.data } };
    }
    return await axios(axiosOptions);
}


async function Login(node, Configs) {
    let url = `${buildBaseUrl(Configs)}/Login`
    const data = { 
        "databaseName": Configs.databaseName,
        "companyUser":Configs.companyUser,
        "companyPassword": Configs.companyPassword,
        "consumerIdentity": Configs.consumerIdentity,
     };

    const options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: data,
        headers: {
          'Content-Type': 'application/json',
        },
    };

    return await axios(options);

}


function getSapParams(node, msg) {
  try {
    let globalContext = node.context().global;
    let idAuthNode = msg[PREFIXNAME].lyc;
    let globalName = `${PREFIXNAME}_${idAuthNode}`;
    let currentelayeroneConfigs = globalContext.get(globalName);

    //node.log(JSON.stringify(currentelayeroneConfigs.headers, null, 4));
   // let headers = currentelayeroneConfigs.headers;
    return { idLayerOneConfigs: currentelayeroneConfigs.layeroneConfigs, currentelayeroneConfigs: currentelayeroneConfigs.configs, headers: currentelayeroneConfigs.headers };
  } catch (error) {
    node.error('You Not Authenticate', msg);

  }
}

function generateRequestSL(node, msg, config, options) {
    options = options || {
      hasRawQuery: false,
      hasEntityId: false,
      isClose: false,
      isCrossJoin: false,
      isPlugins: false,
      service: null,
      manipulateMethod: null,
      method: 'GET',
      data: null,
    };


    options.hasRawQuery = options.hasRawQuery || false;
    options.method = options.method || 'GET';
    options.data = options.data || null;
    options.hasEntityId = options.hasEntityId || false;
    options.isClose = options.isClose || false;
    options.isCrossJoin = options.isCrossJoin || false;
    options.isManipulate = options.isManipulate || false;
    options.isService = options.isService || false;
    options.isCreateSQLQuery = options.isCreateSQLQuery || false;
    options.service = options.service || null;
    options.manipulateMethod = options.manipulateMethod || null;
    options.isPlugins = options.isPlugins || false;
  
    const {idLayerOneConfigs, currentelayeroneConfigs , headers } = getSapParams(node, msg);
  
    let rawQuery = null;
    let baseUrl = buildBaseUrlSL(currentelayeroneConfigs);
    let url;
  
    if (options.hasRawQuery) {
      try {
        rawQuery = eval(config.query);
      } catch (error) {
        throw new Error('Query editor error');
      }
    }
  
    let entity = config.entity;
    if (!entity && !options.isService && !options.isCreateSQLQuery && !options.isSQLQuery) {
      throw new Error('Missing entity');
    }
  
    if (options.isService) {
      if (!config.service) {
        throw new Error('Missing service');
      }
    }
  
    if (entity == 'UDO') {
      entity = config.udo;
    }
  
    if (entity == 'UDT') {
      entity = config.udt;
    }
  
    if (entity == 'script') {
      const partnerName = config.partnerName;
      const scriptName = config.scriptName;
      url = `${baseUrl}/servicelayer/${entity}/${partnerName}/${scriptName}`;
    }
  
    const odataNextLink = msg[config.nextLink];
  
    if (!odataNextLink) {
      url = `${baseUrl}/servicelayer/${entity}`;
    }
  
    if (options.isCrossJoin) {
      url = `${baseUrl}/servicelayer/$crossjoin(${entity})`;
    }
  
    if (options.isSQLQuery) {
      if (!config.sqlCode) {
        throw new Error('Missing sqlCode');
      }
      url = `${baseUrl}/servicelayer/SQLQueries('${msg[config.sqlCode]}')/List`;
    }
  
    if (odataNextLink) {
      url = `${baseUrl}/servicelayer/${odataNextLink}`;
    }
    if (options.isClose && !options.hasEntityId) {
      throw new Error(`The options are not correct. If 'isClose' is true then 'hasEntityId' must be true.`);
    }
  
    if (options.hasEntityId) {
      let entityId = msg[config.entityId];
      if (!entityId && config.entity != 'UDO' && config.entity != 'UDT') {
        throw new Error('Missing entityId');
      }
      const docEntry = msg[config.docEntry];
      if (config.entity == 'UDO') {
        if (!docEntry) {
          throw new Error('Missing docEntry');
        }
        entityId = docEntry;
      }
  
      const code = msg[config.code];
      if (config.entity == 'UDT') {
        if (!code) {
          throw new Error('Missing Code');
        }
        entityId = code;
      }
  
      if (thickIdApi.includes(entity) || config.entity === 'UDT') {
        if(Number.isInteger(entityId)) {
          url = `${baseUrl}/servicelayer/${entity}(${entityId})`;
        }
        else {
          url = `${baseUrl}/servicelayer/${entity}('${entityId}')`;
        }
        
      } else {
        url = `${baseUrl}/servicelayer/${entity}(${entityId})`;
      }
  
      if (options.isClose) {
        url += `/Close`;
      }
  
      if (options.isManipulate) {
        if (!config.manipulateMethod) {
          throw new Error('Missing method');
        }
        if (thickIdApi.includes(entity)) {
          url = `${baseUrl}/servicelayer/${entity}('${entityId}')/${config.manipulateMethod}`;
        } else {
          url = `${baseUrl}/servicelayer/${entity}(${entityId})/${config.manipulateMethod}`;
        }
      }
    }
  
    if (config.service) {
      url = `${baseUrl}/servicelayer/${config.service}`;
    }
  
    if (options.isCreateSQLQuery) {
      if (!config.sqlCode) {
        throw new Error('Missing sqlCode');
      }
      if (!config.sqlName) {
        throw new Error('Missing sqlName');
      }
      if (!config.sqlText) {
        throw new Error('Missing sqlText');
      }
      url = `${baseUrl}/servicelayer/SQLQueries`;
    }
  
    if (rawQuery && !odataNextLink) {
      const urlOdata = buildQuery(rawQuery);
      msg.odata = urlOdata;
      url = `${url}${urlOdata}`;
    }


    const headersMerge = { ...msg[config.headers], ...headers};
  
    let axiosOptions = {
      method: options.method,
      url: url,
      rejectUnauthorized: false,
      withCredentials: true,
      headers: headersMerge,
    };
  
    if (options.data) {
      axiosOptions = { ...axiosOptions, ...{ data: options.data } };
    }
    
    return {
      axiosOptions: axiosOptions,
      idLayerOneConfigs: idLayerOneConfigs,
    };
  }




  async function sendRequest({ node, msg, config, axios, login, options }) {
    if (!node || !msg || !config || !axios || !login) {
      const missingParams = [];
      node ? null : missingParams.push('node');
      msg ? null : missingParams.push('msg');
      config ? null : missingParams.push('config');
      axios ? null : missingParams.push('axios');
      login ? null : missingParams.push('login');
      throw new Error(`Missing mandatory params: ${missingParams.join(',')}.`);
    }

    let requestOptions = generateRequestSL(node, msg, config, options);
   


    try {

      return await axios(requestOptions.axiosOptions);

    } catch (error) {
      if (error.response && error.response.data) {
        msg.statusCode = error.response.status;
        msg.payload = error.response.data;
        msg.requestUrl = requestOptions.axiosOptions.url;
       // node.send(msg);
        throw new Error(JSON.stringify(error.response.data));
      }
      throw error;
    }
  }


module.exports = {
    login: Login,
    HealthCheck: HealthCheck,
    AdoNetQuery: AdoNetQuery,
    JsonBatch: JsonBatch,
    generateRequest: generateRequestSL,
    sendRequest: sendRequest,
    thickIdApi: thickIdApi,
    Plugins: Plugins,
    PREFIXNAME: PREFIXNAME,
};