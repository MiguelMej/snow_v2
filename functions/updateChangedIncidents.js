function updateChangedIncidents (environment, modifiedIncidents, modifiedLastSync) {
    
    var incidentTable = gs.getProperty('x_556309_microsoft.incidentTableName');
    var incidentUniqueKey = gs.getProperty('x_556309_microsoft.incidentUniqueKey');
    var updatedIncidents = 0;
    var addedComments;
    var myObj;
    var changes;
    var newComments = [];
    var utils = new AppUtils();
    var entitiesUtils = new Entities();
    var alertsUtils = new Alerts();


    for (var i = 0; i < modifiedIncidents.length; i++) {

        addedComments = 0;
        myObj = new GlideRecord(incidentTable);
        myObj.addQuery(incidentUniqueKey, modifiedIncidents[i].name);
        myObj.query();

        if(myObj.next()) {
            
            changes = compareChanges(modifiedIncidents[i].properties, myObj);

            if(Object.keys(changes).length > 0) {
                
                
                if(changes.hasOwnProperty('severitySentinel')) {
                    myObj.impact = utils.getServiceNowSeverity(incidents[i].properties.severity);
                }

                if(changes.hasOwnProperty('statusSentinel')) { 
                    myObj.incident_state = utils.getServiceNowState(incidents[i].properties.status);
                    if(incidents[i].properties.status.toLowerCase() == 'closed') {
                        myObj.close_code = 'Closed/Resolved By Caller';
                        myObj.close_notes = 'Incident was already closed in Sentinel. \nIncident classification: ' + incidents[i].properties.classification + '\nClose comment: ' + incidents[i].properties.classificationComment;
                    }
                }

                if(changes.hasOwnProperty('ownerSentinel')) {
                    if(modifiedIncidents[i].properties.owner.userPrincipalName) {
                        myObj.assigned_to = modifiedIncidents[i].properties.owner.userPrincipalName;
                    }
                }

                if(changes.hasOwnProperty('newAlerts')) {
                    // add new alerts sync
                    var htmlAlerts = alertsUtils.getIncidentAlerts(environment, incidents[i].name, 'html', modifiedLastSync);
                    if(htmlAlerts) {
                        myObj.setWorkflow(false);
                        myObj.work_notes = '[code]<h2>Alerts (updated)</h2>' + htmlAlerts + '[/code]';
                        myObj.update();
                        utils.log('Incident ' + myObj.number + ' has been updated with new alerts.');

                    }
                }

                if(changes.hasOwnProperty('newEntities')) {
                    // Add incident entities to Snow
                    var incidentEntities =  entitiesUtils.getIncidentEntities(environment, incidents[i].name, 'json');

                    var htmlEntities = entitiesUtils.entitiesToHtmlTable(incidentEntities);
                    if(htmlEntities) {
                        myObj.setWorkflow(false);
                        myObj.work_notes = '[code]<h2>Entities (updated)</h2>' + htmlEntities + '[/code]';
                        myObj.update();
                    }
                }

                if(changes.hasOwnProperty('newComments')) {
                    // add comments sync
                    newComments = getIncidentComments(environment, modifiedIncidents[i].name, modifiedLastSync); //returns added comments since last sync
                }

                
                try {
                    myObj.setWorkflow(false);
                    myObj.update();
                    updatedIncidents++;
                    utils.log('Incident ' + myObj.number + ' has been updated\nChanges: ' + JSON.stringify(changes));

                    if(newComments.length > 0) {
                        newComments.forEach(function (comment) {
                            myObj.work_notes = '[code]<div class="snow"><b>CreatedTimeUtc: </b>' + comment.properties.createdTimeUtc + '<br><b>Author: </b>' + comment.properties.author.name + '(' + comment.properties.author.userPrincipalName + ')' + '<p><b>Message:</b><br>' + comment.properties.message + '</p></div>[/code]';
                            myObj.update();
                            addedComments++;
                        });
                    }
                }
                catch(ex) {
                    var message = ex.message;
                    utils.log('ERROR: Incident ' + myObj.number + ' update failed\n' + message);
                }
            }

            if(addedComments > 0 || changes.length > 0) {
                utils.log('Incident ' + myObj.number + ' has been updated\nChanges: ' + JSON.stringify(changes) + '\nNew comments: ' + addedComments);
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

