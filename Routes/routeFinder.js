module.exports = (function() {
	var findBestMatchingRoute = function(routes, params) {
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
		for (var i = routes.length; i--;) {
			var pattern = routes[i];
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

	var getUrl = function(bestMatch, params) {
		var qs = [];

		for (var key in params) {
			var toMatch = '{' + key + '}';
			if (!bestMatch.match(toMatch)) {
				qs.push(key + '=' + encodeURIComponent(params[key]));
			} else {
				bestMatch = bestMatch.replace(toMatch, params[key]);
			}
		}

		var qsString = '';

		if (qs.length) {
			qsString = '?' + qs.join('&');
		}

		return bestMatch + qsString;
	};

	var RouteFinder = function RouteFinder(routes) {
		return function(params) {
			var bestMatch = findBestMatchingRoute(routes, params);
			return getUrl(bestMatch, params);
		};
	};

	// Expose a couple of methods for unit testing.
	RouteFinder.findBestMatchingRoute = findBestMatchingRoute;
	RouteFinder.getUrl = getUrl;

	return RouteFinder;
})();