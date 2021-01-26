
//---------------------------------------------------------------
// Get entities to incident
function getIncidentEntities (incidentId) {

    var hasNext = false;
    var filter = null;
    var entities = [];

    // Prepare request
    incidentId = incidentId + '/entities';
    var pagedRequest = buildRESTMessageV2(null, 'post', filter, incidentId);

    do {    
        // Request Sentinel incidents
        var pagedResponse = pagedRequest.execute();
        var pagedResponseBody = pagedResponse.getBody();
        var pagedhttpStatus = pagedResponse.getStatusCode();
        var pagedObj = JSON.parse(pagedResponseBody);

        if(pagedhttpStatus == 200) {
            
            entities = entities.concat(pagedObj.entities);
        }
        else {
            log('Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
        }


        if (pagedObj['nextLink']) { // if true, more incidents available

            hasNext = true;
            var skip = getSkipToken(pagedObj['nextLink']);
            pagedRequest = buildRESTMessageV2(skip, 'post', filter, incidentId); 
        }
        else {
            hasNext = false;
        }

    }while (hasNext);
    
    // Compose entities objects
    var entitiesList = entities.map(function(entity) {
       return {
           "type": entity.kind,
           "details": entity.properties
       } 
    })

    return entitiesList;
}