//---------------------------------------------------------------
// Return Sentinel incidents, based on the filter
function getSentinelIncidents (id) {

    var filter = null;
    if(!id) {
        // update last sync time only for full query, not for single incident by id
        updateLastSync('newIncidentsLastSync');
        filter = '(properties/createdTimeUtc gt 2021-01-13T20:00:00.0Z)'; //to change to use table prop
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