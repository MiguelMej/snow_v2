var CustomMapping = Class.create();
CustomMapping.prototype = {
    initialize: function() {
    },
    setCustomMapping: function(incident,incidentAlerts, incidentEntities) {
        var entitiesUtils = new Entities();
        var incidentTable = gs.getProperty('x_mioms_azsentinel.incidentTableName');
        var incidentUniqueKey = gs.getProperty('x_mioms_azsentinel.incidentUniqueKey');
        var appUtils = new AppUtils();
        var myObj = new GlideRecord(incidentTable);
        myObj.addQuery(incidentUniqueKey, incident.name);
        myObj.query();
        
        if(myObj.next()) {
            // Add your specific mappings below, using the incident entities and alerts

            try {

                // Examples of methods returning specific Sentinel entities types and grouping them into an array to be using within
                // ServiceNow incident properties.
                // In this example, we created in the incident the properties "u_ips", "u_hosts" and "u_impacted users" to store the array as a string in ServiceNow incident
                var ips = entitiesUtils.getEntitiesByType(incidentEntities, 'ip');
                var hosts = entitiesUtils.getEntitiesByType(incidentEntities, 'host');
                var users = entitiesUtils.getEntitiesByType(incidentEntities, 'account');

                if(ips) {
                    //myObj.u_ips = (ips.map(function (ip) {return ip.details.address;})).join(', '); //source_ip
                    //appUtils.log(myObj.u_ips);
                }
                
                if(hosts) {
                    //myObj.u_hosts = (hosts.map(function (host) {return host.details.hostName;})).join(', '); //u_asset_name
                    //appUtils.log(myObj.u_hosts);
                }
                
                if(users) {
                    //myObj.u_impacted_users = (users.map(function (user) {return user.details.accountName;})).join(', '); //affected_user
                    //appUtils.log(myObj.u_impacted_users);
                }

                /////////////////////////////////
                // Other examples of mapping:
                /////////////////////////////////

                // We store the Sentinel incident number in a custom property "u_other_case_number", so we can search for it in ServiceNow
                //myObj.u_other_case_number = incident.properties.incidentNumber;

                // We store the MITRE tactics in the "attack_vector" property
                //myObj.attack_vector = incident.properties.additionalData.tactics.join(', ');

                // We store the source products, like MDE or MCAS, in a custom property named "u_alert_source"
                //myObj.u_alert_source = incident.properties.additionalData.alertProductNames.join(', ');

                // We set the property "contact_type" as 'SIEM'. To add "Sentinel", you have to create a new contact type
                //myObj.contact_type = 'SIEM';
                


                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Examples of mapping adding the impacted devices, based on the correlation between the incident and your CMDB:
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //var myci = new GlideRecord('cmdb_ci');
                //myci.addQuery('name',myObj.u_asset_name); // works for a single impacted device. For multiple devices, add a loop
                //myci.query();
                //if (myci.next()){ 
                //  myObj.cmdb_ci = myci.sys_id.toString();
                //}

                //myObj.update();

            }
            catch (err) {
                appUtils.log('ERROR CustomMapping: ' + err );
            }
        }
        else {
            appUtils.log('ERROR CustomMapping: incident not found');

        }

    },
    type: 'CustomMapping'
};