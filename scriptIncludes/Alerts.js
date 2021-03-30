var Alerts = Class.create();
Alerts.prototype = {
    initialize: function() {
    },
    //---------------------------------------------------------------
    // Get incident alerts 
    getIncidentAlerts: function (environment, incidentId, format, lastSync) {

        var hasNext = false;
        var filter = null;
        var alerts = [];
        var appUtils = new AppUtils();

        if(lastSync) {

            filter = '(properties/timeGenerated gt ' + lastSync + ')';
        }

        // Prepare request
        incidentId = incidentId + '/alerts';
        var pagedRequest = appUtils.buildRESTMessageV2(environment, null, 'post', filter, incidentId);

        do {    
            // Request Sentinel incidents
            var pagedResponse = pagedRequest.execute();
            var pagedResponseBody = pagedResponse.getBody();
            var pagedhttpStatus = pagedResponse.getStatusCode();
            var pagedObj = JSON.parse(pagedResponseBody);

            if(pagedhttpStatus == 200) {
                
                alerts = alerts.concat(pagedObj.value);
            }
            else {
                appUtils.log('Error getting alerts. Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
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
        
        // Compose alerts objects
        try {
            if(alerts.length > 0){
                var alertsList = alerts.map(function(alert) {
                    return {
                        "systemAlertId": alert.properties.systemAlertId,
                        "tactics": alert.properties.tactics.join(','),
                        "name": alert.properties.alertDisplayName,
                        "description": alert.properties.description,
                        "confidenceLevel": alert.properties.confidenceLevel,
                        "severity": alert.properties.severity,
                        "vendor": alert.properties.vendorName,
                        "product": alert.properties.productName,
                        "status": alert.properties.status,
                        "start": alert.properties.startTimeUtc,
                        "end": alert.properties.endTimeUtc,
                        "providerAlertId": alert.properties.providerAlertId,
                        "alertLink": alert.properties.alertLink
                    };
                });

                if(format.toLowerCase() === 'html') {
                    return this.alertsToHtmlTable(alertsList);
                }
                else {
                    return alertsList;
                }
            }
            else {
                return null;
            }
        }
        catch (ex) {
            var message = ex.message;
            appUtils.log('ERROR getIncidentAlerts: ' + message);
        }
    },

    //---------------------------------------------------------------
    // Returns alerts in an HTML table
    alertsToHtmlTable: function(alerts) {
        
        var htmlTable = '<div class="snow"><table style="width: 100%; font-family: arial, sans-serif; border-collapse: collapse"><thead><tr style="border: 1px solid black">';
        htmlTable += '<th colspan="2" style=" background-color: #dddddd; text-align: center; padding: 8px;">Alerts</th>';
        
        var tr = '<tr style="border: 1px solid black"><th style=" background-color: #dddddd; text-align: left; padding: 8px; width:15%;">';
        var separator = '<tr style="border: 1px solid black"><td colspan="2" style=" background-color: #66666666; height: 7px;"></tr>';
        for (var i = 0; i < alerts.length; i++) {
            var alertLink = alerts[i].alertLink ? '<a href="' + alerts[i].alertLink + '" target="_blank">Alert link</a>' : 'No alert link';
            
            htmlTable += tr + 'Name</th><td style="text-align: left; padding: 8px">' + alerts[i].name + '</td></tr>';
            htmlTable += tr + 'Status</th><td style="text-align: left; padding: 8px">' + alerts[i].status + '</td></tr>';
            htmlTable += tr + 'Severity</th><td style="text-align: left; padding: 8px">' + alerts[i].severity + '</td></tr>';
            htmlTable += tr + 'Tactics</th><td style="text-align: left; padding: 8px">' + alerts[i].tactics + '</td></tr>';
            htmlTable += tr + 'Product</th><td style="text-align: left; padding: 8px">' + alerts[i].product + '</td></tr>';
            htmlTable += tr + 'Vendor</th><td style="text-align: left; padding: 8px">' + alerts[i].vendor + '</td></tr>';
            htmlTable += tr + 'Description</th><td style="text-align: left; padding: 8px">' + alerts[i].description + '</td></tr>';
            htmlTable += tr + 'Confidence Level</th><td style="text-align: left; padding: 8px">' + alerts[i].confidenceLevel + '</td></tr>';
            htmlTable += tr + 'Link</th><td style="text-align: left; padding: 8px">' + alertLink + '</td></tr>';
            htmlTable += tr + 'Start</th><td style="text-align: left; padding: 8px">' + alerts[i].start + '</td></tr>';
            htmlTable += tr + 'End</th><td style="text-align: left; padding: 8px">' + alerts[i].end + '</td></tr>';
            
            htmlTable += separator;
        }

        htmlTable += '</tbody></table></div>'; //closing table

        return htmlTable;
    },

        
    type: 'Alerts'
};