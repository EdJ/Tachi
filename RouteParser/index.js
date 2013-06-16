var parsePattern = require('./patternParser');

module.exports = (function() {
	var parseRoutes = function(routes) {
		var parsedRoutes = [];
		routes.forEach(function(route) {
			var parsedRoute = parsePattern(route);
			parsedRoutes.push(parsedRoute);
		});

		return parsedRoutes;
	};

	var RouteParser = function RouteParser(unparsedRouteData) {
		var loginUrl = unparsedRouteData.loginUrl || '/Login';

		var defaultRoute = parsePattern(unparsedRouteData.defaultUrl || '/');

		var parsedRoutes = parseRoutes(unparsedRouteData.routes || []);

		return {
			routes: parsedRoutes,
			statics: unparsedRouteData.statics || [],
			loginUrl: loginUrl,
			defaultRoute: defaultRoute
		};
	};

	// Expose methods for unit testing.
	RouteParser.parseRoutes = parseRoutes;

	return RouteParser;
})();