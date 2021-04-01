var CustomMapping = Class.create();
CustomMapping.prototype = {
    initialize: function() {
    },
    setCustomMapping: function(incident,incidentAlerts, incidentEntities) {
        var entitiesUtils = new Entities();
        var incidentTable = gs.getProperty('x_556309_microsoft.incidentTableName');
        var myObj = new GlideRecord(incidentTable);
        var appUtils = new AppUtils();
        // Add your specific mappings below, using the incident entities and alerts

        try {
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

            myObj.u_other_case_number = incident.properties.incidentNumber;
            myObj.attack_vector = incident.properties.additionalData.tactics.join(', ');
            myObj.u_alert_source = incident.properties.additionalData.alertProductNames.join(', ');
            myObj.contact_type = 'SIEM';

            myObj.update();

        }
        catch (err) {
            appUtils.log('ERROR CustomMapping: ' + err );
        }

    },
    type: 'CustomMapping'
};