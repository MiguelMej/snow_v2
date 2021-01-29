a
//---------------------------------------------------------------
// Get incident alerts 
function getIncidentAlerts (incidentId, format) {

    var hasNext = false;
    var filter = null;
    var alerts = [];

    // Prepare request
    incidentId = incidentId + '/alerts';
    var pagedRequest = buildRESTMessageV2(null, 'post', filter, incidentId);

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
            pagedRequest = buildRESTMessageV2(skip, 'post', filter, incidentId); 
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
    
    var htmlTable = '<table style="width: 80%; font-family: arial, sans-serif; border-collapse: collapse"><thead><tr style="border: 1px solid black">';
    htmlTable += '<th style=" background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Name</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Status</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Severity</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Tactics</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Product</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Vendor</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Confidence Level</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Link</th>';
    htmlTable += '<th style="background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">Start</th>';
    htmlTable += '<th style=" background-color: #dddddd; border: 1px solid #dddddd; text-align: left; padding: 8px;">End</th></tr></thead><tbody>';
    
    for (var i = 0; i < alerts.length; i++) {
        var tr = '<tr style="border: 1px solid black">';

        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].name + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].status + '</td>'; 
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].severity + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].tactics + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].product + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].vendor + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].description + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].confidenceLevel + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + '<a href="' + alerts[i].alertLink + '">alert link</a></td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].start + '</td>';
        tr += '<td style="border: 1px solid #dddddd; text-align: left; padding: 8px">' + alerts[i].end + '</td>';
        tr += '</tr>';
        htmlTable += tr;
    }

    htmlTable += '</tbody></table>'; //closing table

    return htmlTable;
}