
//---------------------------------------------------------------
// Return Sentinel incidents, based on the filter
function getSentinelIncidents (id) {

    var filter = null;
    if(!id) {
        // update last sync time only for full query, not for single incident by id
        updateLastSync('newIncidentsLastSync');
        filter = '(properties/createdTimeUtc gt 2021-01-13T20:00:00.0Z)'; //to change to use table prop
    }
    var hasNext = false;
    var incidents = [];
    var page = 0;    

    // Prepare request
    var pagedRequest = buildRESTMessageV2(null, 'get', filter, id);

    do {    
        // Request Sentinel incidents
        var pagedResponse = pagedRequest.execute();
        var pagedResponseBody = pagedResponse.getBody();
        var pagedhttpStatus = pagedResponse.getStatusCode();
        var pagedObj = JSON.parse(pagedResponseBody);

        if(pagedhttpStatus == 200) {
            if(pagedObj.value) {
                incidents = incidents.concat(pagedObj.value);
            }
            else {
                //one incident only
                incidents = incidents.concat(pagedObj);
            }
        }
        else {
            log('Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
        }


        if (pagedObj['nextLink']) { // if true, more incidents available

            hasNext = true;
            var skip = getSkipToken(pagedObj['nextLink']);
            pagedRequest = buildRESTMessageV2(skip, 'get', filter); 
            page++;
        }
        else {
            hasNext = false;
        }

    }while (hasNext);
    
    return incidents;
}

//---------------------------------------------------------------
// Updates newIncidentsLastSync
function updateLastSync(property) {
        
    var myObj = new GlideRecord('x_556309_microsoft_systemutils');
    now = (new Date()).toISOString();

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
}


//---------------------------------------------------------------
// Create new ServiceNow incidents
function createIncidents (incidents) {

    var callerId = gs.getProperty('x_556309_microsoft.callerId');
    var createdIncidents = 0;
    var incidentSeverity = 1;
    var incidentStatus = 1;
    var myObj;

    for (var i = 0; i < incidents.length; i++) {

        myObj = new GlideRecord('incident');

        myObj.addQuery('correlation_id', incidents[i].name);
        myObj.query();

        if(!myObj.next()) {
            myObj.initialize();
            myObj.short_description = incidents[i].properties.title + ' - Incident number: ' + incidents[i].properties.incidentNumber;
            myObj.description = 'Azure Sentinel incident: ' + incidents[i].properties.incidentNumber + '\nDescription: ' + incidents[i].properties.description + '\nProducts: ' + incidents[i].properties.additionalData.alertProductNames.join() + '\nTactics: ' + incidents[i].properties.additionalData.tactics.join();
            
            switch(incidents[i].properties.severity.toLowerCase()) {
                case 'low': incidentSeverity = 3; break;
                case 'medium': incidentSeverity = 2; break;
                case 'high': incidentSeverity = 1; break;
                default: incidentSeverity = 3; break;
            }
            myObj.impact = incidentSeverity;
            
            switch(incidents[i].properties.status.toLowerCase()) {
                case 'new': incidentStatus = 1; break;
                case 'active': incidentStatus = 2; break;
                case 'closed': {
                                    incidentStatus = 7; //In SNOW, "7" is closed, "6" is resolved
                                    myObj.close_code = 'Closed/Resolved By Caller';
                                    myObj.close_notes = 'Incident was already closed in Sentinel';
                                    break;                
                                }
                default: incidentStatus = 1; break;
            }
            myObj.state = incidentStatus;

            // If owner email empty, use UPN
            if(incidents[i].properties.owner.email) {
                myObj.assigned_to = incidents[i].properties.owner.email;
            }
            else {
                myObj.assigned_to = incidents[i].properties.owner.userPrincipalName;
            }


            myObj.correlation_id = incidents[i].name;
            myObj.caller_id = callerId;

            var record = myObj.insert();
            // add tag and comments to Sentinel
            createdIncidents++;

            myObj = new GlideRecord('incident');
            myObj.get(record);
            myObj.work_notes = "[code]<a href='" + incidents[i].properties.incidentUrl + "' target='_blank'>Azure Sentinel Incident link</a>[/code]";
            myObj.update();

            //addComments(incident, comments)
            
        }

    }

    return createdIncidents;

}

//---------------------------------------------------------------
// Add comments to incident
function addComments (incident, comments) {

}

try {

    //---------------------------------------------------------------
    // Main
    
    // Get new incidents from Azure Sentinel API 
    //var incidents = getSentinelIncidents('a4588555-295b-4c8b-9cdc-b17c5126bb7c');
    var incidents = getSentinelIncidents();
    
    log('Azure Sentinel API returned ' + incidents.length + ' new incidents.');

    // Create new incidents in SNOW
    var createdIncidents = createIncidents(incidents);
    log('New incident created: ' + createdIncidents);

}
catch (ex) {
    var message = ex.message;
    gs.info('ERROR: ' + message);
}