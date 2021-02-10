
try {

    // Get all new incidents from Azure Sentinel API
    var incidents = getSentinelIncidents();
    updateLastSync('newIncidentsLastSync');

    log('Azure Sentinel API returned ' + incidents.length + ' new incidents.');

    if(incidents.length > 0){
        // Create new incidents in SNOW
        var createdIncidents = createIncidents(incidents);
        log('New incident created: ' + createdIncidents);
    }

}
catch (ex) {
    var message = ex.message;
    log('ERROR main createNewIncidents: ' + message);
}