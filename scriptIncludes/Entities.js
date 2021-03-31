var Entities = Class.create();
Entities.prototype = {
    initialize: function() {
    },
    //---------------------------------------------------------------
    // Get incident entities 
    getIncidentEntities: function(environment, incidentId, format) {

        var hasNext = false;
        var filter = null;
        var entities = [];
        var appUtils = new AppUtils();


        // Prepare request
        incidentId = incidentId + '/entities';
        var pagedRequest = appUtils.buildRESTMessageV2(environment, null, 'post', filter, incidentId);

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
                appUtils.log('Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
            }


            if (pagedObj['nextLink']) { // if true, more incidents available

                hasNext = true;
                var skip = appUtils.getSkipToken(pagedObj['nextLink']);
                pagedRequest = appUtils.buildRESTMessageV2(environment, skip, 'post', filter, incidentId); 
            }
            else {
                hasNext = false;
            }

        }while (hasNext);
        
        // Compose entities objects
        try {
            if(entities.length > 0){
                var entitiesList = entities.map(function(entity) {
                    return {
                        "type": entity.kind,
                        "details": entity.properties
                    };
                });

                if(format.toLowerCase() === 'html') {
                    return this.entitiesToHtmlTable(entitiesList);
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
            appUtils.log('ERROR getIncidentEntities: ' + message);
        }
    },

    //---------------------------------------------------------------
    // Create an Html table containing the incident entities
    entitiesToHtmlTable: function(entities) {
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
    },
    //---------------------------------------------------------------
    // Returns the entities of the specified type
    getEntitiesByType: function(entities, type) {
        var appUtils = new AppUtils();
        
        try {
            var entitiesList = entities.filter(function(entity) {
                return entity.type.toLowerCase() == type.toLowerCase();
            });

            return entitiesList;
        }
        catch(err){
            appUtils.log('ERROR getEntitiesByType: ' + err.message);
        }
    },


    type: 'Entities'
};