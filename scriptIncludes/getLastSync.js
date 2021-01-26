//---------------------------------------------------------------
// Returns the last creation or update sync from the sentinelUtils table
function getLastSync(property) {

    var myObj = new GlideRecord('x_556309_microsoft_systemutils');
    var lastSync;

	myObj.addQuery('property', property);
	myObj.query();

	if(myObj.next()) {            
		lastSync = myObj.value;

	}
	else {
		log('System property not found!');
    }
    
    return lastSync;
}