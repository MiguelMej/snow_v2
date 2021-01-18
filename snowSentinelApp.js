//---------------------------------------------------------------
// Request access token using the saved application OAuth application
function getAccessToken () {
    var oAuthClient = new sn_auth.GlideOAuthClient();
    var params = {grant_type:"client_credentials",resource:"https://management.azure.com/"};
    var tokenResponse = oAuthClient.requestToken('Az Sentinel OAuth app',global.JSON.stringify(params));
    return tokenResponse.getToken();
}

//---------------------------------------------------------------
// Return Sentinel incidents, based on the filter
function getSentinelIncidents (endpoint, filter, apiVersion) {

    var request = new sn_ws.RESTMessageV2();
    var token = getAccessToken();

    // Prepare request
    request.setRequestHeader('Authorization','Bearer ' + token.getAccessToken());
    request.setHttpMethod('get');
    request.setRequestHeader('Content-Type','application/json;odata=verbose');
	request.setRequestHeader("Accept","application/json");
    request.setEndpoint(endpoint);
	
	request.setQueryParameter('api-version', apiVersion);
	request.setQueryParameter('$filter', filter);

    // Request Sentinel incidents
    var response = request.execute();
    return JSON.parse(response.getBody()).value;
}

//---------------------------------------------------------------
// Log messages in system log
function log(msg) {
    gs.info(msg);
}

//---------------------------------------------------------------
// Create new ServiceNow incidents
function newIncident (incidents) {

    var callerId = gs.getProperty('x_556309_microsoft.callerId');

    for (var i = 0; i < incidents.length; i++) {

        var myObj = new GlideRecord('incident');

        myObj.addQuery('correlation_id', incidents[i].name);
        myObj.query();
        gs.info('myObj: ' + myObj.next());

        if(!myObj.next()) {
            myObj.short_description = incidents[i].properties.title + ' - ' + incidents[i].properties.incidentNumber;
            myObj.description = 'Azure Sentinel incident ' + incidents[i].properties.incidentNumber + '\n' + incidents[i].properties.description;
            myObj.impact = incidents[i].properties.severity;
            myObj.correlation_id = incidents[i].name;
            myObj.caller_id = callerId;

            myObj.update();
            gs.info('New incident created - ' + incidents[i].name);
        }
        else {
            gs.info('No new incidents');
        }

        }

}


//---------------------------------------------------------------
// Get app properties for API call
var apiVersion = gs.getProperty('x_556309_microsoft.apiVersion');
var subscription = gs.getProperty('x_556309_microsoft.subscription');
var resourceGroup = gs.getProperty('x_556309_microsoft.resourceGroup');
var workspace = gs.getProperty('x_556309_microsoft.workspace');
var filter = gs.getProperty('x_556309_microsoft.newIncidentsFilter');

// Build API endpoint
var endpoint =  'https://management.azure.com/subscriptions/' + subscription + '/resourceGroups/' + resourceGroup + '/providers/Microsoft.OperationalInsights/workspaces/' + workspace + '/providers/Microsoft.SecurityInsights/incidents?';
//log('Endpoint: ' + endpoint + '\nApi version: ' + apiVersion +'\nFilter: ' + filter);

var incidents = getSentinelIncidents(endpoint, filter, apiVersion);
log('Azure Sentinel API queried' + '\nNbr returned incidents: ' + incidents.length + '\nWorkspace: ' + workspace);
newIncident(incidents);

log('End job');

