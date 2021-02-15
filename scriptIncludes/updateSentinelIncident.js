//Function to update Sentinel incidents

function updateSentinelIncident (environment, incidentId, properties) {
    
    var incident = getSentinelIncidents(environment, incidentId)[0]; // getSentinelIncidents returns an array of one element
    incident.properties.status = properties.status;
    if(incident.properties.status.toLowerCase() == 'closed') {
        incident.properties.classification = properties.classification; //Sentinel requires reason when closing incident
        incident.properties.classificationComment = properties.classificationComment;
    }
    incident.properties.severity = properties.severity;
    if(properties.owner) {
        incident.properties.owner.userPrincipalName = properties.owner.userPrincipalName;
    }
    else {
        incident.properties.owner = {
            "objectId": null,
            "email": null,
            "assignedTo": null,
            "userPrincipalName": null
        };
    }
    
    if(incident.properties.labels.length > 0) {
        incident.properties.labels = incident.properties.labels.concat(properties.labels);
        // Dedup array
        var temp = incident.properties.labels;
        temp = temp.map(function(i){return i.labelName;});
        temp = temp.filter(function(item, index) {return temp.indexOf(item) === index;});
        incident.properties.labels = temp.map(function(i){
            return {"labelName": i, "labelType": "User"};
        });
    }
    else {
        incident.properties.labels = properties.labels;
    }
    

    var body = {
        "etag": incident.etag,
        "properties": incident.properties
    };

    var request = buildRESTMessageV2(environment, null, 'put', null, incidentId, body);
    try {
        var response = request.execute();
        var httpStatus = response.getStatusCode();
    }
    catch(ex) {
        log('ERROR updateSentinelIncidents - ' + JSON.stringify(response) + ' - ' + message);
    }
    return httpStatus;
} 
