var AppUtils = Class.create();
AppUtils.prototype = {
    initialize: function() {
    },

    //---------------------------------------------------------------
    // Log messages in system log
    log: function(msg) {
        gs.info(msg);
    },

    //---------------------------------------------------------------
    // This function build the ServiceNow REST message to get the Sentinel incients
    buildRESTMessageV2: function(environment, skipToken, method, filter, incidentId, body) {

        // Get app properties for API call
        var subscription = environment.subscription;
        var resourceGroup = environment.resource_group;
        var workspace = environment.workspace;
        var apiVersion = gs.getProperty('x_556309_microsoft.apiVersion');

        if(incidentId)  {
            if(incidentId.includes('/entities') || incidentId.includes('/alerts')) {
                apiVersion = '2019-01-01-preview'; // alerts and entities only available through the preview version
            }
        }


        // Compose API endpoint
        var endpoint =  'https://management.azure.com/subscriptions/' + subscription + '/resourceGroups/' + resourceGroup + '/providers/Microsoft.OperationalInsights/workspaces/' + workspace + '/providers/Microsoft.SecurityInsights/incidents?';
        var token = getAccessToken(environment);


        request = new sn_ws.RESTMessageV2();

        // Default method is GET
        if(!method) {
            method = 'get';
        }
        request.setHttpMethod(method);
        
        if(filter) {

            request.setQueryParameter('$filter', filter);

        }
        if(incidentId) {
            // asking for specific incident or for incident's comments
            endpoint = endpoint.replace('incidents?', 'incidents/' + incidentId + '?');
        }

        if(skipToken) { 
            request.setQueryParameter('$skipToken', skipToken);
        }
        if(body) {
            request.setRequestBody(JSON.stringify(body));
        }
        
        request.setEndpoint(endpoint);
        request.setRequestHeader('Content-Type','application/json;odata=verbose');
        request.setRequestHeader("Accept","application/json");
        request.setRequestHeader('Authorization','Bearer ' + token.getAccessToken());

        request.setQueryParameter('api-version', apiVersion);
        
        

        return request;

    },

    //---------------------------------------------------------------
    // Return skiptoken when more results to fetch during the API call
    getSkipToken: function(nextLink) {
        var skipToken = nextLink.split('&');
        skipToken = skipToken[skipToken.length -1].replace('$skipToken=', ''); //contains skitToken only

        return skipToken;
    },

    //---------------------------------------------------------------
    // Request access token using the saved application OAuth application
    getAccessToken: function(environment) {
        var oAuthClient = new sn_auth.GlideOAuthClient();
        var params = {grant_type:"client_credentials",resource:"https://management.azure.com/"};
        var tokenResponse = oAuthClient.requestToken(environment.oauth_provider,global.JSON.stringify(params)); //using the Oauth provider specified in the config table
        
        return tokenResponse.getToken();
    },

    //---------------------------------------------------------------
    //Generate a new uuid
    newUuid: function()
    {
        var seed = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (seed + Math.random() * 16) % 16 | 0;
            seed = Math.floor(seed/16);

            return (c === 'x' ? r : r & (0x3|0x8)).toString(16);
        });

        return uuid;
    },

    //---------------------------------------------------------------
    //Return the incident environment ID, based on the value provided in the Description setion
    getEnvironmentId: function(incident) {
        var environmentId = incident.description.split('\n');
        environmentId = environmentId.pop().split(':')[1].trim();
    
        return environmentId;
    },

    //---------------------------------------------------------------
    // Returns the last creation or update sync from the sentinelUtils table
    getLastSync: function(property) {

        var myObj = new GlideRecord('x_556309_microsoft_systemutils');
        var lastSync;

        myObj.addQuery('property', property);
        myObj.query();

        if(myObj.next()) {            
            lastSync = myObj.value;
            if(!lastSync) { // if value not populated, go back 30 days ago
                var date = new Date();
                date.setDate(date.getDate() - 30);
                lastSync = date.toISOString();
                updateLastSync(property, lastSync);
            }

        }
        else {
            log('System property not found!');
        }
        
        return lastSync;
    },

    //---------------------------------------------------------------
    // Updates newIncidentsLastSync
    updateLastSync: function(property, date) {

        var myObj = new GlideRecord('x_556309_microsoft_systemutils');
        var now = (new Date()).toISOString();
        if(date) {
            now = date;
        }

        myObj.addQuery('property', property);
        myObj.query();

        if(myObj.next()) {            
            log('Updating ' + property + '\nPrevious value: ' + myObj.value + '\nNew value: ' + now);
            myObj.value = now;
            myObj.update();

        }
        else {
            log('System property not found!');
        }
    },

    //---------------------------------------------------------------
    // Function to get all instances to collect the incidents from.
    // Workspaces configuration are stored in the "x_556309_microsoft_workspaces_config" (Workspaces Configuration) table
    getSentinelWorkspaces: function() {
        var gr = new GlideRecord('x_556309_microsoft_workspaces_config');
        gr.query();
        var configs = [];

        while (gr.next()) {
            var temp = {
                "caller_id": gr.getValue('caller_id'),
                "description": gr.getValue('description'),
                "environment_id": gr.getValue('environment_id'),
                "environment_name": gr.getValue('environment_name'),
                "oauth_provider": gr.getValue('oauth_provider'),
                "resource_group": gr.getValue('resource_group'),
                "subscription": gr.getValue('subscription'),
                "sys_id": gr.getValue('sys_id'),
                "workspace": gr.getValue('workspace')
                
            };
            configs.push(temp);
        }

        return configs;
    },
    //---------------------------------------------------------------
    // Function comparing Sentinel and ServiceNow incidents and returning differences
    compareChanges: function(sentinelIncident, snowIncident) {
        var changes = {};
        var incidentSeverity;
        var incidentStatus;

        switch(sentinelIncident.severity.toLowerCase()) {
            case 'low': incidentSeverity = 3; break;
            case 'medium': incidentSeverity = 2; break;
            case 'high': incidentSeverity = 1; break;
        }

        switch(sentinelIncident.status.toLowerCase()) {
            case 'new': incidentStatus = 1; break;
            case 'active': incidentStatus = 2; break;
            case 'closed': incidentStatus = 6; break;                
        }

        if((incidentStatus != snowIncident.incident_state) && !((incidentStatus == 6) && (snowIncident.incident_state == 7))) {
            changes.statusSentinel = sentinelIncident.status;
            changes.statusSnow = snowIncident.incident_state.toString();
        } // 6 means incident resolved in snow
        if(incidentSeverity != snowIncident.impact) {
            changes.severitySentinel = sentinelIncident.severity;
            changes.severitySnow = snowIncident.impact.toString();
        }
        if((sentinelIncident.owner.userPrincipalName != snowIncident.assigned_to.email.toString()) && (sentinelIncident.owner.userPrincipalName != null)) { //should remove the filter. Preventing owner update
            changes.ownerSentinel = sentinelIncident.owner.userPrincipalName; 
            changes.ownerSnow = snowIncident.assigned_to.email.toString();
        }

        return changes;
    },

    //---------------------------------------------------------------
    // Returns Sentinel severity, based on the passed ServiceNow severity
    getSentinelSeverity: function(sev) {
		var myObj = new GlideRecord('x_556309_microsoft_servicenow_incident_to_sentinel');
        myObj.addQuery('servicenow_severity', sev.toString());
        myObj.query();

        if(myObj.next()) {
            var sentinelSev = myObj.sentinel_severity;
            return sentinelSev;
        }
		else {
            log('ERROR: No matching Sentinel Severity in table ServiceNow Severity to Sentinel, for severity value: ' + sev);
        }
    },

    //---------------------------------------------------------------
    // Returns ServiceNow severity, based on the passed Sentinel severity
    getServiceNowSeverity: function(sev) {
		var myObj = new GlideRecord('x_556309_microsoft_sentinel_incident_to_servicenow');
        myObj.addQuery('sentinel_severity', sev);
        myObj.query();

        if(myObj.next()) {
            var serviceNowSev = parseInt(myObj.servicenow_severity);
            return serviceNowSev;
        }
		else {
            log('ERROR: No matching ServiceNow Severity in table Sentinel Severity to ServiceNow, for severity value: ' + sev);
        }
    },

    //---------------------------------------------------------------
    // Returns Sentinel state, based on the passed ServiceNow state
    getSentinelState: function(state) {
		var myObj = new GlideRecord('x_556309_microsoft_sentinel_state_to_servicenow');
        myObj.addQuery('servicenow_state', state.toString());
        myObj.query();

        if(myObj.next()) {
            var sentinelState = myObj.sentinel_state;
            return sentinelState;
        }
		else {
            log('ERROR: No matching Sentinel State in table ServiceNow Severity to Sentinel, for state value: ' + sev);
        }
    },

    //---------------------------------------------------------------
    // Returns ServiceNow state, based on the passed Sentinel state
    getServiceNowState: function(state) {
		var myObj = new GlideRecord('x_556309_microsoft_servicenow_state_to_sentinel');
        myObj.addQuery('sentinel_state', state);
        myObj.query();

        if(myObj.next()) {
            var serviceNowState = parseInt(myObj.servicenow_state);
            return serviceNowState;
        }
		else {
            log('ERROR: No matching ServiceNow State in table Sentinel Severity to ServiceNow, for state value: ' + sev);
        }
    },

    type: 'AppUtils'
};