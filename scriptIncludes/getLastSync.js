//---------------------------------------------------------------
// Returns the last creation or update sync from the sentinelUtils table
function getLastSync(property) {

    var myObj = new GlideRecord('x_556309_microsoft_systemutils');
    var lastSync;

	myObj.addQuery('property', property);
	myObj.query();

	if(myObj.next()) {            
		lastSync = myObj.value;
		if(!lastSync) { // if value not populated, go back 30 days ago
			var date = new Date();
			date.setDate(date.getDate() - 30);
			lastSync = date.toISOString();
			updateLastSync(property, lastSync);
		}

	}
	else {
		log('System property not found!');
    }
    
    return lastSync;
}