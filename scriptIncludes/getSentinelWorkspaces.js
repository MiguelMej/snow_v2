// Function to get all instances to collect the incidents from.
// Workspaces configuration are stored in the "x_556309_microsoft_workspaces_config" (Workspaces Configuration) table

function getSentinelWorkspaces () {
    var gr = new GlideRecord('x_556309_microsoft_workspaces_config');
    gr.query();
    var configs = [];

    while (gr.next()) {
        configs.push(gr);
    }

    return configs;
}