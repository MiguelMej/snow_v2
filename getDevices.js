try {
    var machines = [];

    function getMachines(endpoint, machines) {
        gs.info('in getMachines with endpoint: ' + endpoint);
        var pagedR = new sn_ws.RESTMessageV2('NAME OF REST MESSAGE', 'Default GET'); // Replace the first parameter with the name of your REST message.
        if (endpoint !== null) {
            pagedR.setEndpoint(endpoint);
        }
        var pagedResponse = pagedR.execute();
        var pagedResponseBody = pagedResponse.getBody();
        var pagedhttpStatus = pagedResponse.getStatusCode();
        gs.info('windowsMachine response Status: ' + pagedResponseBody);
        var pagedObj = JSON.parse(pagedResponseBody);
        var newMachines = pagedObj.value.filter(function(device) {
            //This is the snippet that filters out only Windows devices. Hence the Windows only shceduled job.
            if (device.operatingSystem == "Windows") {
                return true;
            } else {
                return false;
            }
        });
        gs.info(endpoint + ' : ' + newMachines.length);
        machines = machines.concat(newMachines);
        if (pagedObj["@odata.nextLink"]) { // if it has paged results
            getMachines(pagedObj["@odata.nextLink"], machines);
        } 
        else {
            gs.info('machines.length: ' + machines.length);
            machines.forEach(function(machine) {
                gs.info('in foreach');
                var intuneImport = new GlideRecord('IMPORT SET TABLE NAME'); // Replace with your Import set table name
                intuneImport.initialize();

                //Set each field in the table to the correct data from payload
                for (var key in machine) {
                    if (machine.hasOwnProperty(key)) {
                        var field = key.toLowerCase();
                        var value = (function() {
                            if (typeof machine[key] === "number") {
                                return machine[key].toString();
                            } else {
                                return machine[key];
                            }
                        })()

                        var actualField = 'u_' + field;
                        if (intuneImport.isValidField(actualField)) {
                            gs.info('setting (short)[' + actualField + ']:' + value);
                            intuneImport.setValue(actualField, value);
                        } else {
                            var begin = field.substring(0, 12);
                            var end = field.substring(field.length - 14, field.length);
                            var calculatedField = 'u_' + begin + '_' + end;
                            gs.info('setting (long)[' + calculatedField + ']:' + value);
                            intuneImport.setValue(calculatedField, value);
                        }
                    }
                }

                intuneImport.insert();
            });
        }
    }

    getMachines(null, machines);
} catch (ex) {
    var message = ex.message;
    gs.info('ERROR: ' + message);
}