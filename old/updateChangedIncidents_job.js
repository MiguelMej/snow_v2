// Retriev all configured workspaces
var sentinelIncidents = new SentinelIncidents();
var appUtils = new AppUtils();
var workspaces = appUtils.getSentinelWorkspaces();

for(var i = 0; i < workspaces.length; i++) {
    try {

        try{
            var incidents = sentinelIncidents.getSentinelIncidents(workspaces[i], null, 'update');

            if(incidents.length > 0){
                appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + incidents.length + ' modified incidents.');
                // Update incidents in SNOW
                var modifiedLastSync = appUtils.getLastSync('modifiedIncidentsLastSync', workspaces[i]);
                var modifiedIncidents = sentinelIncidents.updateChangedIncidents(workspaces[i], incidents, modifiedLastSync);
                appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Modified incident: ' + modifiedIncidents);
            }

            appUtils.updateLastSync('modifiedIncidentsLastSync', null, workspaces[i]);
        }
        catch(err) {
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - error in: updateChangedIncidents_job / ' + '\n' + err.message);
        }
    
    }
    catch (ex) {
        var message = ex.message;
        appUtils.log('ERROR main updateChangedIncidents: ' + message);
    }
}
