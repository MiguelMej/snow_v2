// Function comparing Sentinel and SNOW incidents and return differences
function compareChanges(sentinelIncident, snowIncident) {
    var changes = {};
    var incidentSeverity;
    var incidentStatus;

    switch(sentinelIncident.severity.toLowerCase()) {
        case 'low': incidentSeverity = 3; break;
        case 'medium': incidentSeverity = 2; break;
        case 'high': incidentSeverity = 1; break;
    }

    switch(sentinelIncident.status.toLowerCase()) {
        case 'new': incidentStatus = 1; break;
        case 'active': incidentStatus = 2; break;
        case 'closed': incidentStatus = 6; break;                
    }

    if((incidentStatus != snowIncident.incident_state) && !((incidentStatus == 6) && (snowIncident.incident_state == 7))) {
        changes.statusSentinel = sentinelIncident.status;
        changes.statusSnow = snowIncident.incident_state.toString();
    } // 6 means incident resolved in snow
    if(incidentSeverity != snowIncident.impact) {
        changes.severitySentinel = sentinelIncident.severity;
        changes.severitySnow = snowIncident.impact.toString();
    }
    if((sentinelIncident.owner.userPrincipalName != snowIncident.assigned_to.email.toString()) && ((sentinelIncident.owner.userPrincipalName != null) && (snowIncident.assigned_to != null))) {
        changes.ownerSentinel = sentinelIncident.owner.userPrincipalName; 
        changes.ownerSnow = snowIncident.assigned_to.email.toString();
    }

    return changes;
}