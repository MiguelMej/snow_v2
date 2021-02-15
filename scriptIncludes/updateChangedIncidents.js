function updateChangedIncidents (environment, modifiedIncidents, modifiedLastSync) {
    
    var incidentTable = gs.getProperty('x_556309_microsoft.incidentTableName');
    var incidentUniqueKey = gs.getProperty('x_556309_microsoft.incidentUniqueKey');
    var updatedIncidents = 0;
    var addedComments;
    var myObj;
    var changes;
    var newComments = [];

    for (var i = 0; i < modifiedIncidents.length; i++) {

        addedComments = 0;
        myObj = new GlideRecord(incidentTable);
        myObj.addQuery(incidentUniqueKey, modifiedIncidents[i].name);
        myObj.query();

        if(myObj.next()) {
            
            changes = compareChanges(modifiedIncidents[i].properties, myObj);

            if(Object.keys(changes).length > 0) {
                
                
                if(changes.hasOwnProperty('severitySentinel')) {
                    switch(modifiedIncidents[i].properties.severity.toLowerCase()) {
                        case 'low': myObj.impact = 3; break;
                        case 'medium': myObj.impact = 2; break;
                        case 'high': myObj.impact = 1; break;
                    }
                }

                if(changes.hasOwnProperty('statusSentinel')) { 
                    switch(modifiedIncidents[i].properties.status.toLowerCase()) {
                        case 'new': myObj.incident_state = 1; break;
                        case 'active': myObj.incident_state = 2; break;
                        case 'closed': {
                            myObj.incident_state = 6;
                            myObj.close_code = 'Closed/Resolved By Caller';
                            myObj.close_notes = 'Incident closed in Sentinel. \nIncident classification: ' + incidents[i].properties.classification + '\nClose comment: ' + incidents[i].properties.classificationComment;
                            break;                
                        }                         
                    }
                }

                if(changes.hasOwnProperty('ownerSentinel')) {
                    if(modifiedIncidents[i].properties.owner.userPrincipalName) {
                        myObj.assigned_to = modifiedIncidents[i].properties.owner.userPrincipalName;
                    }
                }
                
                try {
                    myObj.setWorkflow(false);
                    myObj.update();
                    updatedIncidents++;
                    log('Incident ' + myObj.number + ' has been updated\nChanges: ' + JSON.stringify(changes));
                }
                catch(ex) {
                    var message = ex.message;
                    log('ERROR: Incident ' + myObj.number + ' update failed\n' + message);
                }
            }
            
            // add comments sync
            newComments = getIncidentComments(environment, modifiedIncidents[i].name, modifiedLastSync); //returns added comments since last sync
            if(newComments.length > 0) {
                newComments.forEach(function (comment) {
                    myObj.work_notes = '[code]<div class="snow"><b>CreatedTimeUtc: </b>' + comment.properties.createdTimeUtc + '<br><b>Author: </b>' + comment.properties.author.name + '(' + comment.properties.author.userPrincipalName + ')' + '<p><b>Message:</b><br>' + comment.properties.message + '</p></div>[/code]';
                    myObj.update();
                    addedComments++;
                });
            }

            
            if(addedComments > 0 || changes.length > 0) {
                log('Incident ' + myObj.number + ' has been updated\nChanges: ' + JSON.stringify(changes) + '\nNew comments: ' + addedComments);
            }
            
        }
        else {
            var incidentToCreate = []; 
			incidentToCreate.push(modifiedIncidents[i]);
            createIncidents(environment, incidentToCreate);
        }
    }
    
    return updatedIncidents;
}

