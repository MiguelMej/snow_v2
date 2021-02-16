// Function to get all instances to collect the incidents from.
// Workspaces configuration are stored in the "x_556309_microsoft_workspaces_config" (Workspaces Configuration) table

function getSentinelWorkspaces () {
    var gr = new GlideRecord('x_556309_microsoft_workspaces_config');
    gr.query();
    var configs = [];

    while (gr.next()) {
		var temp = {
			"caller_id": gr.getValue('caller_id'),
			"description": gr.getValue('description'),
			"environment_id": gr.getValue('environment_id'),
			"environment_name": gr.getValue('environment_name'),
			"oauth_provider": gr.getValue('oauth_provider'),
			"resource_group": gr.getValue('resource_group'),
			"subscription": gr.getValue('subscription'),
			"sys_id": gr.getValue('sys_id'),
			"workspace": gr.getValue('workspace')
			
		};
        configs.push(temp);
    }

    return configs;
}