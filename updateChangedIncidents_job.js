// Retriev all configured workspaces
var workspaces = getSentinelWorkspaces();

for(var i = 0; i < workspaces.length; i++) {
    try {

        // Get modified incidents from Azure Sentinel API
        log('Environment: ' + workspaces[i].environment_name + ' - retrieveing modified incidents...');
        var incidents = getSentinelIncidents(workspaces[i], null, 'update');
        var modifiedLastSync = getLastSync('modifiedIncidentsLastSync');
        
        log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + incidents.length + ' modified incidents.');
    
        if(incidents.length > 0){
            // Update incidents in SNOW
            var modifiedIncidents = updateChangedIncidents(workspaces[i], incidents, modifiedLastSync);
            log('Environment: ' + workspaces[i].environment_name + ' - Modified incident: ' + modifiedIncidents);
        }
        
    
    }
    catch (ex) {
        var message = ex.message;
        log('ERROR main updateChangedIncidents: ' + message);
    }
}

updateLastSync('modifiedIncidentsLastSync');