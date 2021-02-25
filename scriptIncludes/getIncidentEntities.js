t
//---------------------------------------------------------------
// Get incident entities 
function getIncidentEntities (environment, incidentId, format) {

    var hasNext = false;
    var filter = null;
    var entities = [];

    // Prepare request
    incidentId = incidentId + '/entities';
    var pagedRequest = buildRESTMessageV2(environment, null, 'post', filter, incidentId);

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
            pagedRequest = buildRESTMessageV2(environment, skip, 'post', filter, incidentId); 
        }
        else {
            hasNext = false;
        }

    }while (hasNext);
    
    // Compose entities objects
    try {
        if(entities.length > 0){
            //log('entities: ' + JSON.stringify(entities));
            var entitiesList = entities.map(function(entity) {
                return {
                    "type": entity.kind,
                    "details": entity.properties
                };
            });

            if(format.toLowerCase() === 'html') {
                return entitiesToHtmlTable(entitiesList);
            }
            else {
                return entitiesList;
            }
        }
        else {
            return null;
        }
    }
    catch (ex) {
        var message = ex.message;
        log('ERROR getIncidentEntities: ' + message);
    }
}

    

function entitiesToHtmlTable (entities) {
    
    var htmlTable = '<div class="snow"><table style="width: 100%; font-family: arial, sans-serif; border-collapse: collapse"><thead><tr style="border: 1px solid black"><th style="background-color: #dddddd; text-align: left;padding: 8px; width: 10%;">EntityType</th><th style="background-color: #dddddd; text-align:center; padding: 8px;">EntityDetails</th></tr></thead><tbody>';
    
    for (var i = 0; i < entities.length; i++) {
        var tr = '<tr style="border: 1px solid black"><th style="text-align: left; padding: 8px; background-color: #dddddd;">';

        tr += entities[i].type + '</th><td style="text-align: left; padding: 8px">';
        
        var keys = Object.keys(entities[i].details);
        var propTable = '<table>';

        for (var j = 0; j < keys.length; j++) {
            var value = '';
            if(entities[i].details[keys[j].toString()] instanceof Object) {
                value = JSON.stringify(entities[i].details[keys[j].toString()]);
            }
            else {
                value = entities[i].details[keys[j].toString()].toString();
            }

            propTable += '<tr><th>' + keys[j] + '</th><td>' + value + '</td></tr>';
        }

        propTable += '</table>';
        tr += propTable;
        tr += '</td></tr>';
        
        
        htmlTable += tr;
    }

    htmlTable += '</tbody></table></div>'; //closing table

    return htmlTable;
}