function getEnvironmentId(incident) {
    var environmentId = incident.description.split('\n');
	environmentId = environmentId.pop().split(':')[1].trim();

    return environmentId;
}