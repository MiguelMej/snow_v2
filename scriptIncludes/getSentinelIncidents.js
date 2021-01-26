//---------------------------------------------------------------
// Return Sentinel incidents, based on the filter
function getSentinelIncidents (id, operation) {

    var filter = null;
    var lastSync = null;

    if(!id) {
        if(operation === 'update') {
            lastSync = getLastSync('modifiedIncidentsLastSync'); //returns last sync from sentinelUtils table
            filter = '(properties/lastModifiedTimeUtc gt '+ lastSync + ')';
        }
        else { // searching for new incidents
            lastSync = getLastSync('newIncidentsLastSync');
            filter = '(properties/createdTimeUtc gt '+ lastSync + ')';
        }
    }
    var hasNext = false;
    var incidents = [];
    var page = 0;    

    // Prepare request
    var pagedRequest = buildRESTMessageV2(null, 'get', filter, id);

    do {    
        // Request Sentinel incidents
        var pagedResponse = pagedRequest.execute();
        var pagedResponseBody = pagedResponse.getBody();
        var pagedhttpStatus = pagedResponse.getStatusCode();
        var pagedObj = JSON.parse(pagedResponseBody);

        if(pagedhttpStatus == 200) {
            if(pagedObj.value) {
                incidents = incidents.concat(pagedObj.value);
            }
            else {
                //one incident only
                incidents = incidents.concat(pagedObj);
            }
        }
        else {
            log('Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
        }


        if (pagedObj['nextLink']) { // if true, more incidents available

            hasNext = true;
            var skip = getSkipToken(pagedObj['nextLink']);
            pagedRequest = buildRESTMessageV2(skip, 'get', filter); 
            page++;
        }
        else {
            hasNext = false;
        }

    }while (hasNext);
    
    return incidents;
}