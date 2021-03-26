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

// Initialize x_556309_microsoft_sentinel_incident_to_servicenow
var severities = ['Informal', 'Low', 'Medium', 'High'];
var sentinelSeverity = new GlideRecord("x_556309_microsoft_sentinel_incident_to_servicenow");

for(var i=0; i < severities.length; i++) {
    sentinelSeverity.newRecord();
    sentinelSeverity.sentinel_severity = severities[i];
    switch (severities[i]) {
        case 'High': sentinelSeverity.servicenow_severity = 1;
            break;
        case 'Medium': sentinelSeverity.servicenow_severity = 2;
            break;
        case 'Low': sentinelSeverity.servicenow_severity = 3;
            break;
        default: sentinelSeverity.servicenow_severity = 3;
            break;
    }
    sentinelSeverity.insert();
}


// Initialize x_556309_microsoft_servicenow_incident_to_sentinel
var servicenowSeverity = new GlideRecord('x_556309_microsoft_servicenow_incident_to_sentinel');

for(var i = 1; i <= 3; i++) {
    servicenowSeverity.newRecord();
    servicenowSeverity.servicenow_severity = i;

    switch (servicenowSeverity.servicenow_severity) {
        case 1: servicenowSeverity.sentinel_severity = 'High';
            break;
        case 2: servicenowSeverity.sentinel_severity = 'Medium';
            break;
        case 3: servicenowSeverity.sentinel_severity = 'Low';
            break;
        default: servicenowSeverity.sentinel_severity = 'Low';
            break;
    }
    servicenowSeverity.insert();

}

