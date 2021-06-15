// Script initiating the sentinelUtils and API parameters
// Initialize the last syncs back to 30 days
var date = new Date();
date.setDate(date.getDate() - 30);
var lastSync = date.toISOString();

// Initialize the first Azure Sentinel workspace configuration
var workspaceConfig = new GlideRecord("x_557806_microsoft_workspaces_configuration");
workspaceConfig.name = 'Company Sentinel Workspace';
workspaceConfig.insert();

// Initialize "Sentinel Severity to ServiceNow" table(x_557806_microsoft_sentinel_incident_to_servicenow)
var severities = ['Informational', 'Low', 'Medium', 'High'];
var sentinelSeverityRecord = new GlideRecord("x_557806_microsoft_sentinel_incident_to_servicenow");

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


// Initialize "ServiceNow Severity to Sentinel" table (x_557806_microsoft_servicenow_incident_to_sentinel)
var snowSeveritieRecord = new GlideRecord('x_557806_microsoft_servicenow_incident_to_sentinel');
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

// Initialize "Sentinel State to ServiceNow" table (x_557806_microsoft_sentinel_state_to_servicenow)
var sentinelStates = ['New', 'Active', 'Closed'];
var sentinelStatesRecord = new GlideRecord("x_557806_microsoft_sentinel_state_to_servicenow");

for(var i=0; i < sentinelStates.length; i++) {
    sentinelStatesRecord.initialize();
    sentinelStatesRecord.sentinel_state = sentinelStates[i];

    switch (sentinelStates[i]) {
        case 'New': sentinelStatesRecord.servicenow_state = '1';
            break;
        case 'Active': sentinelStatesRecord.servicenow_state = '2';
            break;
        case 'Closed': sentinelStatesRecord.servicenow_state = '6';
            break;
    }
    sentinelStatesRecord.insert();
}


// Initialize "ServiceNow State to Sentinel" table (x_557806_microsoft_sentinel_state_to_servicenow)
var snowStates = ['1', '2', '3', '6', '7', '8', '10', '16', '18', '19', '20', '100'];
var snowStatesRecord = new GlideRecord("x_557806_microsoft_servicenow_state_to_sentinel");

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


// Initialize "ServiceNow State to Sentinel" table (x_557806_microsoft_sentinel_state_to_servicenow)
var snowCodes = ['200', '201', '202', '203', '204', '205', '206', '207', '208'];
var closureClassificationRecord = new GlideRecord("x_557806_microsoft_closure_classification");

for(var i=0; i < snowCodes.length; i++) {
    closureClassificationRecord.initialize();
    closureClassificationRecord.servicenowcode = snowCodes[i];
    closureClassificationRecord.label = 'Closure code - ' + snowCodes[i];

    switch (snowCodes[i]) {
        case '200': closureClassificationRecord.sentinelcode = 'TruePositive-SuspiciousActivity'; closureClassificationRecord.sourceissentinel = true;
            break;
        case '201': closureClassificationRecord.sentinelcode = 'BenignPositive-SuspiciousButExpected'; closureClassificationRecord.sourceissentinel = true;
            break;
        case '202': closureClassificationRecord.sentinelcode = 'FalsePositive-InaccurateData'; closureClassificationRecord.sourceissentinel = true;
            break;
        case '203': closureClassificationRecord.sentinelcode = 'FalsePositive-IncorrectAlertLogic'; closureClassificationRecord.sourceissentinel = true;
            break;
        case '204': closureClassificationRecord.sentinelcode = 'Undetermined'; closureClassificationRecord.sourceissentinel = true;
            break;
        case '205': closureClassificationRecord.sentinelcode = 'Undetermined'; closureClassificationRecord.sourceissentinel = false;
            break;
        case '206': closureClassificationRecord.sentinelcode = 'Undetermined'; closureClassificationRecord.sourceissentinel = false;
            break;
        case '207': closureClassificationRecord.sentinelcode = 'Undetermined'; closureClassificationRecord.sourceissentinel = false;
            break;
        case '208': closureClassificationRecord.sentinelcode = 'Undetermined'; closureClassificationRecord.sourceissentinel = false;
            break;
        
    }
    closureClassificationRecord.insert();
}

