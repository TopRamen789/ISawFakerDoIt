var APIOperations = (function() {
	function setDefaults(method) {
		return {
			method: (typeof method !== 'undefined') ? method : 'logAPIData'
		}
	}

	function sendToHandler(params, method) {
		var defaults = setDefaults(method);
		APIDataHandler.handler(params, defaults.method);
	}

	function getSummonerInfo(params, method) {
		sendToHandler('v1.4/summoner/by-name/' + params + '?', method);
	}

	function getSummonerMatchList(params, method) {
		sendToHandler('v2.2/matchlist/by-summoner/' + params + '?', method);
	}

	function getMatch(params, method) {
		sendToHandler('v2.2/match/' + params  + '?', method);
	}

	function getMatchWithTimeline(params, method) {
		sendToHandler('v2.2/match/' + params + '?includeTimeline=true', method);
	}

	return {
		getSummonerInfo: getSummonerInfo,
		getSummonerMatchList: getSummonerMatchList,
		getMatch: getMatch,
		getMatchWithTimeline: getMatchWithTimeline
	}
})();

//module.exports = APIOperations;