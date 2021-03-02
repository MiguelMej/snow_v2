//---------------------------------------------------------------
// This function build the ServiceNow REST message to get the Sentinel incients
function buildRESTMessageV2(environment, skipToken, method, filter, incidentId, body) {

    // Get app properties for API call
    var subscription = environment.subscription; //gs.getProperty('x_556309_microsoft.subscription');
    var resourceGroup = environment.resource_group; //gs.getProperty('x_556309_microsoft.resourceGroup');
    var workspace = environment.workspace; //gs.getProperty('x_556309_microsoft.workspace');
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

}