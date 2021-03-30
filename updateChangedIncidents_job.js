// Retriev all configured workspaces
var sentinelIncidents = new SentinelIncidents();
var appUtils = new AppUtils();
var workspaces = appUtils.getSentinelWorkspaces();

for(var i = 0; i < workspaces.length; i++) {
    try {

        // Get modified incidents from Azure Sentinel API
        appUtils.log('Environment: ' + workspaces[i].environment_name + ' - retrieveing modified incidents...');
        var incidents = sentinelIncidents.getSentinelIncidents(workspaces[i], null, 'update');
        var modifiedLastSync = appUtils.getLastSync('modifiedIncidentsLastSync');
        
        appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + incidents.length + ' modified incidents.');
    
        if(incidents.length > 0){
            // Update incidents in SNOW
            var modifiedIncidents = sentinelIncidents.updateChangedIncidents(workspaces[i], incidents, modifiedLastSync);
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Modified incident: ' + modifiedIncidents);
        }
        
    
    }
    catch (ex) {
        var message = ex.message;
        appUtils.log('ERROR main updateChangedIncidents: ' + message);
    }
}

appUtils.updateLastSync('modifiedIncidentsLastSync');