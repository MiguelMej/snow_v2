//---------------------------------------------------------------
// Get comments to incident
function getIncidentComments (incidentId, lastSync) {

    var filter = null;
    if(lastSync) {

        filter = '(properties/createdTimeUtc gt ' + lastSync + ')';
    }
    var hasNext = false;
    var comments = [];

    // Prepare request
    incidentId = incidentId + '/comments';
    var pagedRequest = buildRESTMessageV2(null, 'get', filter, incidentId);

    do {    
        // Request Sentinel incidents
        var pagedResponse = pagedRequest.execute();
        var pagedResponseBody = pagedResponse.getBody();
        var pagedhttpStatus = pagedResponse.getStatusCode();
        var pagedObj = JSON.parse(pagedResponseBody);

        if(pagedhttpStatus == 200) {
            
            comments = comments.concat(pagedObj.value);
        }
        else {
            log('Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
        }


        if (pagedObj['nextLink']) { // if true, more incidents available

            hasNext = true;
            var skip = getSkipToken(pagedObj['nextLink']);
            pagedRequest = buildRESTMessageV2(skip, 'get', filter, incidentId); 
        }
        else {
            hasNext = false;
        }

    }while (hasNext);
    
    // Filters out the comments created by SNOW. This app adds "(Work notes)" when adding a comment to Sentinel
    var filteredComments = comments.filter(function (comment) {
        return comment.properties.message.toLowerCase().indexOf('(work notes)') === -1;
    });
    filteredComments = filteredComments.filter(function (comment) {
        return comment.properties.message.toLowerCase().indexOf('[code]') === -1;
    });
    

    // Sort comments by creation date
    if(filteredComments) {
        filteredComments.sort(function(a, b){
            var x = new Date(a.properties.createdTimeUtc);
            var y = new Date(b.properties.createdTimeUtc);
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });
        filteredComments.reverse();
    }

    return filteredComments;
}