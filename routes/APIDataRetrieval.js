var express = require('express');
var router = express.Router();

var request = require('request');
require('dotenv').load();

var APIDataRetrieval = (function() {
	var region = 'na';
	var apiUrl = 'https://na.api.pvp.net/api/lol/' + region;
	var data;

	function generateUrl(params) {
		var url = apiUrl + '/' + params + '&api_key=' + process.env.RIOT_API_KEY;
		return url;
	}

	function callRiotAPI(params, callback) {
		if(typeof data != 'undefined') {
			console.log('Retrieved from memory');
			callback(data);
		}
		request(generateUrl(params), function(error, response, body) {
			console.log('Retrieved via request');
			data = body;
			callback(body);
		});
	}

	return {
		callRiotAPI: callRiotAPI
	}
})();

router.post('/', function(req, res) {
	APIDataRetrieval.callRiotAPI(req.body.params, function(body) {
		res.json(body);
	});
});

module.exports = router;