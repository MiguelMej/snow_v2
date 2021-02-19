//---------------------------------------------------------------
// Create new ServiceNow incidents
function createIncidents (environment, incidents) {

    var callerId = environment.caller_id;
    var incidentTable = gs.getProperty('x_556309_microsoft.incidentTableName');
    var incidentUniqueKey = gs.getProperty('x_556309_microsoft.incidentUniqueKey');
    var createdIncidents = 0;
    var incidentSeverity = 1;
    var incidentStatus = 1;
    var myObj;

    for (var i = 0; i < incidents.length; i++) {

        myObj = new GlideRecord(incidentTable);

        myObj.addQuery(incidentUniqueKey, incidents[i].name);
        myObj.query();

        if(!myObj.next()) {
            myObj.initialize();
            myObj.short_description = incidents[i].properties.title + ' - Incident number: ' + incidents[i].properties.incidentNumber;
            myObj.description = 'Environment: ' + environment.environment_name + '\nAzure Sentinel incident: ' + incidents[i].properties.incidentNumber + '\nDescription: ' + incidents[i].properties.description + '\nProducts: ' + incidents[i].properties.additionalData.alertProductNames.join() + '\nTactics: ' + incidents[i].properties.additionalData.tactics.join() + '\nIncident link: ' + incidents[i].properties.incidentUrl + '\nEnvironmentID: ' + environment.environment_id;
            
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
                                    incidentStatus = 6; //In SNOW, "7" is closed, "6" is resolved
                                    myObj.close_code = 'Closed/Resolved By Caller';
                                    myObj.close_notes = 'Incident was already closed in Sentinel. \nIncident classification: ' + incidents[i].properties.classification + '\nClose comment: ' + incidents[i].properties.classificationComment;
                                    break;                
                                }
                default: incidentStatus = 1; break;
            }
            myObj.incident_state = incidentStatus;

            // If owner email empty, use UPN
            if(incidents[i].properties.owner.email) {
                myObj.assigned_to = incidents[i].properties.owner.email;
            }
            else {
                myObj.assigned_to = incidents[i].properties.owner.userPrincipalName;
            }
            
            // Correlation id is used to link the SNOW incident to Sentinel incident
            myObj.setValue(incidentUniqueKey, incidents[i].name);
            myObj.caller_id = callerId;
            
            // record contains the snow incident id and incident is saved in the database
            try {
                var record = myObj.insert();
                createdIncidents++;
            }
            catch(ex) {
                var message = ex.message;
                log('ERROR inserting incident: ' + message);
            }

            // Add Sentinel incident url link in work notes
            myObj = new GlideRecord(incidentTable);
            myObj.get(record);
            myObj.setWorkflow(false);
            myObj.work_notes = "[code]<div class=\"snow\"><a href='" + incidents[i].properties.incidentUrl + "' target='_blank'>Azure Sentinel incident link</a></div>[/code]";
            myObj.update();

            // Add incident alerts details
			var html = getIncidentAlerts(environment, incidents[i].name, 'html');
            if(html) {
                myObj.setWorkflow(false);
                myObj.work_notes = '[code]' + html + '[/code]';
                myObj.update();
            }

            // Add incident entities to Snow
            var html = getIncidentEntities(environment, incidents[i].name, 'html');
            if(html) {
                myObj.setWorkflow(false);
                myObj.work_notes = '[code]' + html + '[/code]';
                myObj.update();
            }
            //Add Sentinel comments to work notes
            var comments = getIncidentComments(environment, incidents[i].name);
            if(comments) {
                comments.forEach(function (comment){
                    myObj.work_notes = '[code]<div class="snow"><b>CreatedTimeUtc: </b>' + comment.properties.createdTimeUtc + '<br><b>Author: </b>' + comment.properties.author.name + '(' + comment.properties.author.userPrincipalName + ')' + '<p><b>Message:</b><br>' + comment.properties.message + '</p></div>[/code]';
                    myObj.update();
                });

            }

            // Adds ServiceNow incident number in Sentinel tags
            var labelIncidentId = [{
                "labelName": myObj.number.toString(),
                "labelType": "User"
            }];
            var properties = incidents[i].properties;
            properties.labels = labelIncidentId;
            updateSentinelIncident(environment, incidents[i].name, properties);
            
            // Adds SNOW incident link in Sentinel
            try {
                var incidentUrl = createUrlForObject(incidentTable, record);
                var msg = '<div class="snow">' + incidentUrl + '</div>';
                var httpStatus = addIncidentComments(environment, incidents[i].name, msg);
                if(httpStatus != 201) {
                    log('ERROR: incident ' + myObj.number  + '\n' + httpStatus + ' - Comment not added to Sentinel\n' + msg);
                }

            }
            catch (ex) {
                var message = ex.message;
                log('ERROR adding SNOW incident link to Sentinel: ' + message);
            }
            
        }

    }

    return createdIncidents;

}

// Creates an url to the created ServiceNow record
function createUrlForObject(table_name, sys_id){
    var url = gs.getProperty('glide.servlet.uri') + 'nav_to.do?uri=%2F' + table_name + '.do?sys_id=' + sys_id;
    return "<a href=" +  url + ">ServiceNow incident link</a>";
}
