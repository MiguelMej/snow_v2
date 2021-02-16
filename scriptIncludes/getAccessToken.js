//---------------------------------------------------------------
// Request access token using the saved application OAuth application
function getAccessToken (environment) {
	var oAuthClient = new sn_auth.GlideOAuthClient();
	var params = {grant_type:"client_credentials",resource:"https://management.azure.com/"};
	var tokenResponse = oAuthClient.requestToken(environment.oauth_provider,global.JSON.stringify(params)); //using the Oauth provider specified in the config table
	return tokenResponse.getToken();
}