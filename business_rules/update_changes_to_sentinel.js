(function executeRule(current, previous) {
	var status = gs.getProperty('x_556309_microsoft.statusField');
    var severity = gs.getProperty('x_556309_microsoft.severityField');
    var appUtils = new AppUtils();
    var environmentId = appUtils.getEnvironmentId(current);
    var sentinelIncidents = new SentinelIncidents();

	var gr = new GlideRecord('x_556309_microsoft_workspaces_config');
	gr.addQuery('environment_id', environmentId);
	gr.query();
	if(gr.next()) {
		var environment = gr;
	}
	else {
		appUtils.log('ERROR: environment ' + environmentId + 'not found!');
	}

    try {
            var myObj = current;
            var incident = sentinelIncidents.getSentinelIncidents(environment, myObj.correlation_id);
            var changes = appUtils.compareChanges(incident[0].properties, myObj); //changes is an object with all changes
            var properties = incident[0].properties;
            
            if (Object.keys(changes).length > 0) { //if at least one change

                if(changes.hasOwnProperty('severitySentinel')) { //severity must be updated in Sentinel
                    properties.severity = (appUtils.getSentinelSeverity(myObj[severity])).toString();					
               
                }
                
                if(changes.hasOwnProperty('statusSentinel')) { //status must be updated in Sentinel
                    properties.status = (appUtils.getSentinelState(myObj[status])).toString();

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
                
                var httpStatus = sentinelIncidents.updateSentinelIncident(environment, myObj.correlation_id, properties); //update Sentinel incident

                if(httpStatus == 200) {
                    appUtils.log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' has been updated after snow updates.\nChanges: ' + JSON.stringify(changes));
                }
                else if(httpStatus == 409) {
                    httpStatus = sentinelIncidents.updateSentinelIncident(environment, myObj.correlation_id, properties);
                    appUtils.log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' has been updated after snow updates.\nChanges: ' + JSON.stringify(changes));
                }
                else {
                    appUtils.log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' update fails. Code: ' + httpStatus + '\nChanges: ' + JSON.stringify(changes));
                }

            }

    }
    catch (ex) {
        var message = ex.message;
        appUtils.log('ERROR updating incident (business rule)' + current.number + ' - ' + message);
            }
})(current, previous);