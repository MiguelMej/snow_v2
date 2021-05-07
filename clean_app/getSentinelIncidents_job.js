// Retriev all configured workspaces
var appUtils = new AppUtils();
var workspaces = appUtils.getSentinelWorkspaces();
var sentinelIncidents = new SentinelIncidents();

if(workspaces.length == 0) {
	appUtils.log('No active workspace');
}

for(var i = 0; i < workspaces.length; i++) {

    // Retrieve and create workspace's new incidents since last sync
    try{
        var newIncidents = sentinelIncidents.getSentinelIncidents(workspaces[i]); //returns incidents for the passed environment

        if(newIncidents.length > 0){
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + newIncidents.length + ' new incidents.');
            // Create new incidents in SNOW
            var createdIncidents = sentinelIncidents.createIncidents(workspaces[i], newIncidents);
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - New incident created: ' + createdIncidents);
        }

        appUtils.updateLastSync('newIncidentsLastSync', null, workspaces[i]);
    }
    catch(err) {
        appUtils.log('Environment: ' + workspaces[i].environment_name + ' - error in: createNewIncidents_job / ' + err.type + '\n' + err.message);
    }

    // Retrieve and update workspace's incidents since last sync
    try{
        var updatedIncidents = sentinelIncidents.getSentinelIncidents(workspaces[i], null, 'update');

        if(updatedIncidents.length > 0){
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + updatedIncidents.length + ' modified incidents.');
            // Update incidents in SNOW
            var modifiedLastSync = appUtils.getLastSync('modifiedIncidentsLastSync', workspaces[i]);
            var modifiedIncidents = sentinelIncidents.updateChangedIncidents(workspaces[i], updatedIncidents, modifiedLastSync);
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Modified incident: ' + modifiedIncidents);
        }

        appUtils.updateLastSync('modifiedIncidentsLastSync', null, workspaces[i]);
    }
    catch(err) {
        appUtils.log('Environment: ' + workspaces[i].environment_name + ' - error in: updateChangedIncidents_job / ' + '\n' + err.message);
    }

}