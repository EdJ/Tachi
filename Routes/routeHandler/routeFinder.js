module.exports = (function() {
	var findBestMatchingRoute = function(patterns, params) {
		var paramKeys = [];
		for (var key in params) {
			if (params[key]) {
				paramKeys.push(key);
			}
		}

		if (!paramKeys.length) {
			return '';
		}

		var bestMatch = '';
		var currentBest = 0;
		for (var i = patterns.length; i--;) {
			var pattern = patterns[i];
			var patternItems = pattern._parameters;

			if (patternItems.length > paramKeys.length) {
				continue;
			}

			var matches = 0;
			for (var j = paramKeys.length; j--;) {
				if ( !! ~patternItems.indexOf(paramKeys[j])) {
					matches++;
				}
			}

			if (matches > currentBest && matches == patternItems.length) {
				currentBest = matches;
				bestMatch = pattern.url;
			}
		}

		return bestMatch;
	};

	var RouteFinder = function RouteFinder() {
	};

	RouteFinder.findBestMatchingRoute = findBestMatchingRoute;

	return RouteFinder;
})();