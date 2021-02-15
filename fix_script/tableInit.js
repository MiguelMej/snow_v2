// Script initiating the sentinelUtils and API parameters
// Initialize the last syncs back to 30 days
var date = new Date();
date.setDate(date.getDate() - 30);
var lastSync = date.toISOString();


var utils = new GlideRecord("x_556309_microsoft_systemutils");
utils.newRecord();
utils.property = 'newIncidentsLastSync';
utils.value = lastSync;
utils.insert();

utils = new GlideRecord("x_556309_microsoft_systemutils");
utils.newRecord();
utils.property = 'modifiedIncidentsLastSync';
utils.value = lastSync;
utils.insert();

// Initialize the first Azure Sentinel workspace configuration
var workspaceConfig = new GlideRecord("x_556309_microsoft_workspaces_config");
workspaceConfig.name = 'Company Sentinel Workspace';
workspaceConfig.insert();
