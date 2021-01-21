//Function to update Sentinel incidents

function updateSentinelIncident (incidentId, properties) {
    
    var incident = getSentinelIncidents(incidentId)[0]; // getSentinelIncidents returns an array of one element
    incident.properties.status = properties.status;
    incident.properties.severity = properties.severity;
    incident.properties.owner.userPrincipalName = properties.owner.userPrincipalName;
    
    if(incident.properties.labels.length >= 0) {
        incident.properties.labels = incident.properties.labels.concat(properties.labels);
        // Dedup array
        incident.properties.labels = incident.properties.labels.filter(function (item,index){
            return (incident.properties.labels.indexOf(item) == index);
        });
    }
    else {
        incident.properties.labels = properties.labels;
    }
    
    var body = {
        "etag": incident.etag,
        "properties": incident.properties
    };

    var request = buildRESTMessageV2(null, 'put', null, incidentId, body);

    var response = request.execute();
    var httpStatus = response.getStatusCode();

    return httpStatus;
} 
