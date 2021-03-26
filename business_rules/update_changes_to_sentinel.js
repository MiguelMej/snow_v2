(function executeRule(current, previous) {
	
    var environmentId = getEnvironmentId(current);
    var utils = new AppUtils();

	var gr = new GlideRecord('x_556309_microsoft_workspaces_config');
	gr.addQuery('environment_id', environmentId);
	gr.query();
	if(gr.next()) {
		var environment = gr;
	}
	else {
		utils.log('ERROR: environment ' + environmentId + 'not found!');
	}

    try {
            var myObj = current;
            var incident = getSentinelIncidents(environment, myObj.correlation_id);
            var changes = compareChanges(incident[0].properties, myObj); //changes is an object with all changes
            var properties = incident[0].properties;
            
            if (Object.keys(changes).length > 0) { //if at least one change

                if(changes.hasOwnProperty('severitySentinel')) { //severity must be updated in Sentinel
                    properties.severity = (utils.getSentinelSeverity(myObj.impact)).toString();					
               
                }
                
                if(changes.hasOwnProperty('statusSentinel')) { //status must be updated in Sentinel
                    properties.status = (utils.getSentinelState(myObj.state)).toString();

					if(properties.status == 'Closed') {
                        properties.classification = 'Undetermined';
                        properties.classificationComment = 'Incident marked as Resolved in ServiceNow: ' + current.close_notes;
                    }
                }
                
                if(changes.hasOwnProperty('ownerSentinel')) { //owner must be updated in Sentinel
                    if(!myObj.assigned_to.email.toString()) {
                        properties.owner = null;
                    }
                    else {
                        properties.owner.userPrincipalName = myObj.assigned_to.email.toString();
                    }
                }
                
                var httpStatus = updateSentinelIncident(environment, myObj.correlation_id, properties); //update Sentinel incident

                if(httpStatus == 200) {
                    utils.log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' has been updated after snow updates.\nChanges: ' + JSON.stringify(changes));
                }
                else if(httpStatus == 409) {
                    httpStatus = updateSentinelIncident(environment, myObj.correlation_id, properties);
                    utils.log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' has been updated after snow updates.\nChanges: ' + JSON.stringify(changes));
                }
                else {
                    utils.log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' update fails. Code: ' + httpStatus + '\nChanges: ' + JSON.stringify(changes));
                }

            }

    }
    catch (ex) {
        var message = ex.message;
        utils.log('ERROR updating incident (business rule)' + current.number + ' - ' + message);
            }
})(current, previous);