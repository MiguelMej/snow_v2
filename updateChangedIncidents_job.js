//---------------------------------------------------------------
    // Main
    try {

        // Get modified incidents from Azure Sentinel API
        var incidents = getSentinelIncidents(null, 'update');
        var modifiedLastSync = getLastSync('modifiedIncidentsLastSync');
        updateLastSync('modifiedIncidentsLastSync');
        
        log('Azure Sentinel API returned ' + incidents.length + ' modified incidents.');
    
        if(incidents.length > 0){
            // Update incidents in SNOW
            var modifiedIncidents = updateChangedIncidents(incidents, modifiedLastSync);
            log('Modified incident: ' + modifiedIncidents);
        }
        
    
    }
    catch (ex) {
        var message = ex.message;
        log('ERROR main updateChangedIncidents: ' + message);
    }