
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
            
            // record contains the snow incident id
            var record = myObj.insert();

            // add tag and comments to Sentinel
            createdIncidents++;

            myObj = new GlideRecord('incident');
            myObj.get(record);
            myObj.work_notes = "[code]<a href='" + incidents[i].properties.incidentUrl + "' target='_blank'>Azure Sentinel Incident link</a>[/code]";
            myObj.update();

            //Add Sentinel comments to work notes
            var comments = getIncidentComments(incidents[i].name);
            if(comments) {
                comments.forEach(function (comment){
                    myObj.work_notes = '[code]<b>CreatedTimeUtc: </b>' + comment.properties.createdTimeUtc + '<br><b>Author: </b>' + comment.properties.author.name + '(' + comment.properties.author.userPrincipalName + ')' + '<p><b>Message:</b><br>' + comment.properties.message + '</p>[/code]';
                    myObj.update();
                });

            }
            
        }

    }

    return createdIncidents;

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