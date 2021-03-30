(function executeRule(current, previous /*null when async*/) {
	var sentinelIncidents = new SentinelIncidents();
	var appUtils = new AppUtils();
	var environmentId = appUtils.getEnvironmentId(current);

	var gr = new GlideRecord('x_556309_microsoft_workspaces_config');
	gr.addQuery('environment_id', environmentId);
	gr.query();
	if(gr.next()) {
		var environment = gr;
	}
	else {
		appUtils.log('ERROR: environment ' + environmentId + 'not found!');
	}

	try {
        var msg = current.work_notes.getJournalEntry(1);
        //Filtering out Sentinel incidents already added to work notes 
        if (msg.toLowerCase().indexOf('<div class="snow">') === -1) {
			msg = '<div class="snow">' + msg + '</div>';
			var httpStatus = sentinelIncidents.addIncidentComments(environment, current.correlation_id, msg);
			if(httpStatus != 201) {
				appUtils.log('ERROR: incident ' + current.number  + '\n' + httpStatus + ' - Comment not added to Sentinel\n' + msg);
			}
		}
        
	}
	catch (ex) {
		var message = ex.message;
		appUtils.log('ERROR: ' + message);
            }

})(current, previous);