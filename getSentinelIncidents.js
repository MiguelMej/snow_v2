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
