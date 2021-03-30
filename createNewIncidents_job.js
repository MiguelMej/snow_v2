// Retriev all configured workspaces
var appUtils = new AppUtils();
var workspaces = appUtils.getSentinelWorkspaces();
var sentinelIncidents = new SentinelIncidents();

for(var i = 0; i < workspaces.length; i++) {

	try {
        // Get all new incidents from Azure Sentinel API
		appUtils.log('Environment: ' + workspaces[i].environment_name + ' - retrieveing new incidents...');
        var incidents = sentinelIncidents.getSentinelIncidents(workspaces[i]); //returns incidents for the passed environment

        appUtils.log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + incidents.length + ' new incidents.');

        if(incidents.length > 0){
            // Create new incidents in SNOW
            var createdIncidents = sentinelIncidents.createIncidents(workspaces[i], incidents);
            appUtils.log('Environment: ' + workspaces[i].environment_name + ' - New incident created: ' + createdIncidents);
        }

    }
    catch (ex) {
        var message = ex.message;
        appUtils.log('Environment: ' + workspaces[i].environment_name + ' ERROR main createNewIncidents: ' + message);
    }
}

appUtils.updateLastSync('newIncidentsLastSync');