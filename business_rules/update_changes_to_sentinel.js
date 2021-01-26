(function executeRule(current, previous) {

    try {
            var myObj = current;
            var incident = getSentinelIncidents(myObj.correlation_id);
            var changes = compareChanges(incident[0].properties, myObj); //changes is an object with all changes
            var properties = incident[0].properties;
            
            if (Object.keys(changes).length > 0) { //if at least one change

                if(changes.hasOwnProperty('severitySentinel')) { //severity must be updated in Sentinel

                    switch(myObj.impact.toString()) {
                        case '3': 
                            properties.severity = 'Low'; 
                            break;
                        case '2': 
                            properties.severity = 'Medium'; 
                            break;
                        case '1': 
                            properties.severity = 'High'; 
                            break;
                        default: 
                            properties.severity = 'Medium'; 
                            break;
                    }

                    
                }
                
                if(changes.hasOwnProperty('statusSentinel')) { //status must be updated in Sentinel
                    switch(myObj.state.toString()) {
                        case '1': 
                            properties.status = 'New'; 
                            break;
                        case '2': 
                            properties.status = 'Active'; 
                            break;
                        case '6': { 
                                    properties.status = 'Closed'; 
                                    properties.classification = 'Undetermined';
                                    properties.classificationComment = 'Incident marked as Resolved in ServiceNow';
                                    break;                
                                }
                        case '7': { 
                                    properties.status = 'Closed';
                                    properties.classification = 'Undetermined';
                                    properties.classificationComment = 'Incident marked as Closed in ServiceNow';
                                    break;                
                        }
                        default: 
                            properties.status = 'Active';
                            break;
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
                
                var httpStatus = updateSentinelIncident(myObj.correlation_id, properties); //update Sentinel incident

                if(httpStatus == 200) {
                    log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' has been updated after snow updates.\nChanges: ' + JSON.stringify(changes));
                }
                else if(httpStatus == 409) {
                    httpStatus = updateSentinelIncident(myObj.correlation_id, properties);
                    log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' has been updated after snow updates.\nChanges: ' + JSON.stringify(changes));
                }
                else {
                    log(httpStatus + ' - Sentinel Incident ' + incident[0].properties.incidentNumber + ' update fails. Code: ' + httpStatus + '\nChanges: ' + JSON.stringify(changes));
                }

            }

    }
    catch (ex) {
        var message = ex.message;
        log('ERROR updating incident (business rule)' + current.number + ' - ' + message);
            }
})(current, previous);