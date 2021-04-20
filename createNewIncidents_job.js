// Retriev all configured workspaces
var appUtils = new AppUtils();
var workspaces = appUtils.getSentinelWorkspaces();
var sentinelIncidents = new SentinelIncidents();

for(var i = 0; i < workspaces.length; i++) {
	try {
        // Get all new incidents from Azure Sentinel API
		//appUtils.log('Environment: ' + workspaces[i].environment_name + ' - retrieveing new incidents...');

        try{
            var incidents = sentinelIncidents.getSentinelIncidents(workspaces[i]); //returns incidents for the passed environment

            if(incidents.length > 0){
                appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + incidents.length + ' new incidents.');
                // Create new incidents in SNOW
                var createdIncidents = sentinelIncidents.createIncidents(workspaces[i], incidents);
                appUtils.log('Environment: ' + workspaces[i].environment_name + ' - New incident created: ' + createdIncidents);
            }

            appUtils.updateLastSync('newIncidentsLastSync');
        }
        catch(err) {
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - error in: createNewIncidents_job / ' + err.type + '\n' + err.message);
        }

    }
    catch (ex) {
        var message = ex.message;
        appUtils.log('Environment: ' + workspaces[i].environment_name + ' ERROR main createNewIncidents: ' + message);
    }
}