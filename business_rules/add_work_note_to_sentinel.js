(function executeRule(current, previous /*null when async*/) {

	try {
        var msg = current.work_notes.getJournalEntry(1);
        //Filtering out Sentinel incidents already added to work notes 
        if((msg.toLowerCase().indexOf('createdtimeutc:') === -1) && (msg.toLowerCase().indexOf('[code]:') === -1)) {
            var httpStatus = addIncidentComments(current.correlation_id, msg);
            if(httpStatus != 201) {
                log('ERROR: incident ' + current.number  + '\n' + httpStatus + ' - Comment not added to Sentinel\n' + msg);
            }

        }
        
	}
	catch (ex) {
		var message = ex.message;
		log('ERROR: ' + message);
            }

})(current, previous);