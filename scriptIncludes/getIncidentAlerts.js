//---------------------------------------------------------------
// Get incident alerts 
function getIncidentAlerts (environment, incidentId, format) {

    var hasNext = false;
    var filter = null;
    var alerts = [];

    // Prepare request
    incidentId = incidentId + '/alerts';
    var pagedRequest = buildRESTMessageV2(environment, null, 'post', filter, incidentId);

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
            log('Error getting alerts. Error code: ' + pagedhttpStatus + '\nMessage:\n' + pagedResponseBody);
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
    
    // Compose alerts objects
    try {
        if(alerts.length > 0){
            //log('alerts: ' + JSON.stringify(alerts));
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
                return alertsToHtmlTable(alertsList);
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
        log('ERROR getIncidentAlerts: ' + message);
    }
}

    

function alertsToHtmlTable (alerts) {
    
    var htmlTable = '<div class="snow"><table style="width: 100%; font-family: arial, sans-serif; border-collapse: collapse"><thead><tr style="border: 1px solid black">';
    htmlTable += '<th colspan="2" style=" background-color: #dddddd; border: 2px solid #dddddd; text-align: center; padding: 8px;">Alerts</th>';
    
    var tr = '<tr style="border: 1px solid black"><th style=" background-color: #dddddd; text-align: left; padding: 8px; width:15%;">';
    var separator = '<tr style="border: 1px solid black"><td colspan="2" style=" background-color: black; height: 7px;"></tr>';
    for (var i = 0; i < alerts.length; i++) {
        
        htmlTable += tr + 'Name</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].name + '</td></tr>';
        htmlTable += tr + 'Status</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].status + '</td></tr>';
        htmlTable += tr + 'Severity</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].severity + '</td></tr>';
        htmlTable += tr + 'Tactics</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].tactics + '</td></tr>';
        htmlTable += tr + 'Product</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].product + '</td></tr>';
        htmlTable += tr + 'Vendor</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].vendor + '</td></tr>';
        htmlTable += tr + 'Description</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].description + '</td></tr>';
        htmlTable += tr + 'Confidence Level</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].confidenceLevel + '</td></tr>';
        htmlTable += tr + 'Link</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + '<a href="' + alerts[i].alertLink + '">alert link</a></td></tr>';
        htmlTable += tr + 'Start</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].start + '</td></tr>';
        htmlTable += tr + 'End</th><td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].end + '</td></tr>';
        
        htmlTable += separator;
    }

    htmlTable += '</tbody></table></div>'; //closing table

    return htmlTable;
}