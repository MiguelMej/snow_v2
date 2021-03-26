//---------------------------------------------------------------
// Return skiptoken
function getSkipToken(nextLink) {
	var skipToken = nextLink.split('&');
	skipToken = skipToken[skipToken.length -1].replace('$skipToken=', ''); //contains skitToken only

	return skipToken;
}