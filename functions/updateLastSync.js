//---------------------------------------------------------------
// Updates newIncidentsLastSync
function updateLastSync(property, date) {

	var myObj = new GlideRecord('x_556309_microsoft_systemutils');
	var now = (new Date()).toISOString();
	if(date) {
		now = date;
	}

	myObj.addQuery('property', property);
	myObj.query();

	if(myObj.next()) {            
		log('Updating ' + property + '\nPrevious value: ' + myObj.value + '\nNew value: ' + now);
		myObj.value = now;
		myObj.update();

	}
	else {
		log('System property not found!');
	}
}