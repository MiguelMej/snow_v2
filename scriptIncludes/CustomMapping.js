var CustomMapping = Class.create();
CustomMapping.prototype = {
    initialize: function() {
    },
    setCustomMapping: function(incident,incidentAlerts, incidentEntities) {
        var entitiesUtils = new Entities();
        var myObj = new GlideRecord(incidentTable);
        // Add your specific mappings below, using the incident entities and alerts

        var ips = entitiesUtils.getEntitiesByType(incidentEntities, 'ip');
        var hosts = entitiesUtils.getEntitiesByType(incidentEntities, 'host');
        var users = entitiesUtils.getEntitiesByType(incidentEntities, 'account');

        if(ips) {
            myObj.u_ips = (ips.map(function (ip) {return ip.details.address;})).join(', ');
            appUtils.log(myObj.u_ips);
        }
        
        if(hosts) {
            myObj.u_hosts = (hosts.map(function (host) {return host.details.hostName;})).join(', ');
            appUtils.log(myObj.u_hosts);
        }
        
        if(users) {
            myObj.u_impacted_users = (users.map(function (user) {return user.details.accountName;})).join(', ');
            appUtils.log(myObj.u_impacted_users);
        }

        myObj.u_other_case_number = incident.property.incidentNumber;
        myObj.attack_vector = incident.property.additionalData.tactics.toString();
        myObj.u_alert_source = incident.property.additionalData.alertProductNames;
        myObj.contact_type = 'SIEM';

        myObj.update();


    },
    type: 'CustomMapping'
};