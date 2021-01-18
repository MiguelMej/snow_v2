
    //---------------------------------------------------------------
    // Log messages in system log
    function log(msg) {
        gs.info(msg);
    }

    //---------------------------------------------------------------
    // Request access token using the saved application OAuth application
    function getAccessToken () {
        var oAuthClient = new sn_auth.GlideOAuthClient();
        var params = {grant_type:"client_credentials",resource:"https://management.azure.com/"};
        var tokenResponse = oAuthClient.requestToken('Az Sentinel OAuth app',global.JSON.stringify(params));
        return tokenResponse.getToken();
    }

    //---------------------------------------------------------------
    // Return skiptoken
    function getSkipToken(nextLink) {
        var skipToken = nextLink.split('&');
        skipToken = skipToken[skipToken.length -1].replace('$skipToken=', ''); //contains skitToken only

        return skipToken;
    }

    //---------------------------------------------------------------
    // This function build the ServiceNow REST message to get the Sentinel incients
    function buildRESTMessageV2(skipToken) {

        // Get app properties for API call
        var subscription = gs.getProperty('x_556309_microsoft.subscription');
        var resourceGroup = gs.getProperty('x_556309_microsoft.resourceGroup');
        var workspace = gs.getProperty('x_556309_microsoft.workspace');
        var apiVersion = gs.getProperty('x_556309_microsoft.apiVersion');
        // Compose API endpoint
        var endpoint =  'https://management.azure.com/subscriptions/' + subscription + '/resourceGroups/' + resourceGroup + '/providers/Microsoft.OperationalInsights/workspaces/' + workspace + '/providers/Microsoft.SecurityInsights/incidents?';

        var filter = gs.getProperty('x_556309_microsoft.newIncidentsFilter'); 
        var token = getAccessToken();

        request = new sn_ws.RESTMessageV2();
        
        request.setEndpoint(endpoint);
        request.setHttpMethod('get');

        request.setRequestHeader('Content-Type','application/json;odata=verbose');
        request.setRequestHeader("Accept","application/json");
        request.setRequestHeader('Authorization','Bearer ' + token.getAccessToken());

        request.setQueryParameter('api-version', apiVersion);
        request.setQueryParameter('$filter', filter);
        if(skipToken) {
            request.setQueryParameter('$skipToken', skipToken);
        }

        return request;

    }


    //---------------------------------------------------------------
    // Return Sentinel incidents, based on the filter
    function getSentinelIncidents () {

        var hasNext = false;
        var incidents = [];
        var page = 0;

        // Prepare request
        var pagedRequest = buildRESTMessageV2();
        updateLastSync('newIncidentsLastSync');

        do {    
            // Request Sentinel incidents
            var pagedResponse = pagedRequest.execute();
            var pagedResponseBody = pagedResponse.getBody();
            var pagedhttpStatus = pagedResponse.getStatusCode();
            //log('Page ' + page + ' response status: ' + pagedhttpStatus);
            var pagedObj = JSON.parse(pagedResponseBody);

            if(pagedhttpStatus == 200) {
                incidents = incidents.concat(pagedObj.value);    
            }
            else {
                log('Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
            }


            if (pagedObj['nextLink']) { // if true, more incidents available

                hasNext = true;
                var skip = getSkipToken(pagedObj['nextLink']);
                var pagedRequest = buildRESTMessageV2(skip); 
                page++;
            }
            else {
                hasNext = false;
            }

        }while (hasNext);
        
        return incidents;
    }

    //---------------------------------------------------------------
    // Updates new incidents last sync
    function updateLastSync(property) {
            
        var myObj = new GlideRecord('x_556309_microsoft_systemutils');
        now = (new Date()).toISOString();

        myObj.addQuery('property', property);
        myObj.query();

        if(myObj.next()) {            
            log('Updating newIncidentsLastSync...\nPrevious value: ' + myObj.value + '\nNew value: ' + now);
            myObj.value = now;
            myObj.update();

        }
        else {
            log('System property not found!')
        }
    }


    //---------------------------------------------------------------
    // Create new ServiceNow incidents
    function createIncidents (incidents) {

        var callerId = gs.getProperty('x_556309_microsoft.callerId');
        var createdIncidents = 0;

        for (var i = 0; i < incidents.length; i++) {

            var myObj = new GlideRecord('incident');

            myObj.addQuery('correlation_id', incidents[i].name);
            myObj.query();
            //log('myObj: ' + myObj.next());

            if(!myObj.next()) {
                myObj.short_description = incidents[i].properties.title + ' - ' + incidents[i].properties.incidentNumber;
                myObj.description = 'Azure Sentinel incident ' + incidents[i].properties.incidentNumber + '\n' + incidents[i].properties.description;
                myObj.impact = incidents[i].properties.severity;
                myObj.correlation_id = incidents[i].name;
                myObj.caller_id = callerId;

                myObj.update();
                createdIncidents++;
                
            }

        }

        return createdIncidents;

    }

    try {

    //---------------------------------------------------------------
    // Main
    
    // Get new incidents from Azure Sentinel API 
    incidents = getSentinelIncidents();
    log('Azure Sentinel API returned ' + incidents.length + ' new incidents.');

    // Create new incidents in SNOW
    //var createdIncidents = createIncidents(incidents);
    //log('New incident created: ' + createdIncidents);

}
catch (ex) {
    var message = ex.message;
    gs.info('ERROR: ' + message);
}