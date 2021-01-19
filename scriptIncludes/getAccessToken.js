//---------------------------------------------------------------
// Request access token using the saved application OAuth application
function getAccessToken () {
	var oAuthClient = new sn_auth.GlideOAuthClient();
	var params = {grant_type:"client_credentials",resource:"https://management.azure.com/"};
	var tokenResponse = oAuthClient.requestToken('Az Sentinel OAuth app',global.JSON.stringify(params));
	return tokenResponse.getToken();
}