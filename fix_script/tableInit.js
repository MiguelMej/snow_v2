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

// Initialize "Sentinel Severity to ServiceNow" table(x_556309_microsoft_sentinel_incident_to_servicenow)
var severities = ['Informational', 'Low', 'Medium', 'High'];
var sentinelSeverityRecord = new GlideRecord("x_556309_microsoft_sentinel_incident_to_servicenow");

for(var i=0; i < severities.length; i++) {
    sentinelSeverityRecord.initialize();
    sentinelSeverityRecord.sentinel_severity = severities[i];

    switch (severities[i]) {
        case 'High': sentinelSeverityRecord.servicenow_severity = '1';
            break;
        case 'Medium': sentinelSeverityRecord.servicenow_severity = '2';
            break;
        case 'Low': sentinelSeverityRecord.servicenow_severity = '3';
            break;
        case 'Informational': sentinelSeverityRecord.servicenow_severity = '3';
            break;
    }
    sentinelSeverityRecord.insert();
}


// Initialize "ServiceNow Severity to Sentinel" table (x_556309_microsoft_servicenow_incident_to_sentinel)
var snowSeveritieRecord = new GlideRecord('x_556309_microsoft_servicenow_incident_to_sentinel');
var snowSeverities = ['1', '2', '3'];

for(var i=0; i < snowSeverities.length; i++) {

    snowSeveritieRecord.initialize();
    snowSeveritieRecord.servicenow_severity = snowSeverities[i];

    switch (snowSeverities[i]) {
        case '1': snowSeveritieRecord.sentinel_severity = 'High';
            break;
        case '2': snowSeveritieRecord.sentinel_severity = 'Medium';
            break;
        case '3': snowSeveritieRecord.sentinel_severity = 'Low';
            break;
    }
    snowSeveritieRecord.insert();

}

// Initialize "Sentinel State to ServiceNow" table (x_556309_microsoft_sentinel_state_to_servicenow)
var sentinelStates = ['New', 'Active', 'Closed'];
var sentinelStatesRecord = new GlideRecord("x_556309_microsoft_sentinel_state_to_servicenow");

for(var i=0; i < sentinelStates.length; i++) {
    sentinelStatesRecord.initialize();
    sentinelStatesRecord.sentinel_state = sentinelStates[i];

    switch (sentinelStates[i]) {
        case 'New': sentinelStatesRecord.servicenow_state = '10';
            break;
        case 'Active': sentinelStatesRecord.servicenow_state = '16';
            break;
        case 'Closed': sentinelStatesRecord.servicenow_state = '3';
            break;
    }
    sentinelStatesRecord.insert();
}


// Initialize "ServiceNow State to Sentinel" table (x_556309_microsoft_sentinel_state_to_servicenow)
var snowStates = ['1', '2', '3', '6', '7', '8', '10', '16', '18', '19', '20', '100'];
var snowStatesRecord = new GlideRecord("x_556309_microsoft_servicenow_state_to_sentinel");

for(var i=0; i < snowStates.length; i++) {
    snowStatesRecord.initialize();
    snowStatesRecord.servicenow_state = snowStates[i];

    switch (snowStates[i]) {
        case '1': snowStatesRecord.sentinel_state = 'New';
            break;
        case '2': snowStatesRecord.sentinel_state = 'Active';
            break;
        case '3': snowStatesRecord.sentinel_state = 'Closed';
            break;
        case '6': snowStatesRecord.sentinel_state = 'Closed';
            break;
        case '7': snowStatesRecord.sentinel_state = 'Closed';
            break;
        case '8': snowStatesRecord.sentinel_state = 'Closed';
            break;
        case '10': snowStatesRecord.sentinel_state = 'New';
            break;
        case '16': snowStatesRecord.sentinel_state = 'Active';
            break;
        case '18': snowStatesRecord.sentinel_state = 'Active';
            break;
        case '19': snowStatesRecord.sentinel_state = 'Active';
            break;
        case '20': snowStatesRecord.sentinel_state = 'Active';
            break;
        case '100': snowStatesRecord.sentinel_state = 'Active';
            break;
    }
    snowStatesRecord.insert();
}



