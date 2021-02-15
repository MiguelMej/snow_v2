// Retriev all configured workspaces
var workspaces = getSentinelWorkspaces();

for(var i = 0; i < workspaces.length; i++) {

	try {
        // Get all new incidents from Azure Sentinel API
		log('Environment: ' + workspaces[i].environment_name + ' - retrieveing new incidents...');
        var incidents = getSentinelIncidents(workspaces[i]); //returns incidents for the passed environment
        updateLastSync('newIncidentsLastSync');

        log('Environment: ' + workspaces[i].environment_name + ' - Azure Sentinel API returned ' + incidents.length + ' new incidents.');

        if(incidents.length > 0){
            // Create new incidents in SNOW
            var createdIncidents = createIncidents(workspaces[i], incidents);
            log('Environment: ' + workspaces[i].environment_name + ' - New incident created: ' + createdIncidents);
        }

    }
    catch (ex) {
        var message = ex.message;
        log('Environment: ' + workspaces[i].environment_name + ' ERROR main createNewIncidents: ' + message);
    }
}