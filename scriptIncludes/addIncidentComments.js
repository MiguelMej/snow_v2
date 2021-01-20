//---------------------------------------------------------------
// Add comments to incident
function addIncidentComments (incidentId, comment) {

    var msg = {
        "properties": {
            "message": comment
        }     
    };
    var uuid = newUuid();

    // Building endpoint based on incident id + comments + comment uuid
    incidentId = incidentId + '/comments/' + uuid;
    var request = buildRESTMessageV2(null, 'put', null, incidentId, msg);

    var response = request.execute();
    var httpStatus = response.getStatusCode();

    return httpStatus;
}