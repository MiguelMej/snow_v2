function updateChangedIncidents (modifiedIncidents, modifiedLastSync) {
    
    var updatedIncidents = 0;
    var addedComments;
    var myObj;
    var changes;
    var newComments = [];

    for (var i = 0; i < modifiedIncidents.length; i++) {

        addedComments = 0;
        myObj = new GlideRecord('incident');
        myObj.addQuery('correlation_id', modifiedIncidents[i].name);
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
                        case 'new': myObj.state = 1; break;
                        case 'active': myObj.state = 2; break;
                        case 'closed': myObj.state = 7; break;                        
                    }
                }

                if(changes.hasOwnProperty('ownerSentinel')) {
                    if(modifiedIncidents[i].properties.owner.userPrincipalName) {myObj.assigned_to.email = modifiedIncidents[i].properties.owner.userPrincipalName;}
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
            newComments = getIncidentComments(modifiedIncidents[i].name, modifiedLastSync); //returns added comments since last sync
            if(newComments.length > 0) {
                newComments.forEach(function (comment) {
                    myObj.work_notes = '[code]<b>CreatedTimeUtc: </b>' + comment.properties.createdTimeUtc + '<br><b>Author: </b>' + comment.properties.author.name + '(' + comment.properties.author.userPrincipalName + ')' + '<p><b>Message:</b><br>' + comment.properties.message + '</p>[/code]';
                    myObj.update();
                    addedComments++;
                });
            }

            
            if(addedComments > 0 || changes.length > 0) {
                log('Incident ' + myObj.number + ' has been updated\nChanges: ' + JSON.stringify(changes) + '\nNew comments: ' + addedComments);
            }
            
        }
        else {
            log('Modified incident ' + modifiedIncidents[i].name + ' not found in ServiceNow');
        }
    }
    
    return updatedIncidents;
}


//---------------------------------------------------------------
    // Main
    try {

        // Get modified incidents from Azure Sentinel API
        var incidents = getSentinelIncidents(null, 'update');
        var modifiedLastSync = getLastSync('modifiedIncidentsLastSync');
        updateLastSync('modifiedIncidentsLastSync');
        
        log('Azure Sentinel API returned ' + incidents.length + ' modified incidents.');
    
        if(incidents.length > 0){
            // Update incidents in SNOW
            var modifiedIncidents = updateChangedIncidents(incidents, modifiedLastSync);
            log('Modified incident: ' + modifiedIncidents);
        }
    
    }
    catch (ex) {
        var message = ex.message;
        log('ERROR main updateChangedIncidents: ' + message);
    }