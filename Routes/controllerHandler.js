var authHandler = require('../Auth/authHandler');

module.exports = (function() {
	var redirect = function(response, location) {
		response.writeHead(302, {
			'Location': location
		});

		response.end();
	};

	var getAction = function(request, response, data, classLoader) {
		var controller = classLoader.getController(data.controller || '', request, response);
		if (!controller) {
			return false;
		}

		var action = (data.action || 'index').toLowerCase();

		if (data._method === 'POST' && controller[action + '_post']) {
			action = action + '_post';
		}

		if (controller && controller[action]) {
			return {
				controller: controller,
				action: action
			};
		}

		return false;
	};

	var ControllerHandler = function ControllerHandler(defaultRoute, loginUrl, classLoader) {
		return function(request, response, data) {
			var deferred = new Deferred();

			if (!data || !data.controller) {
				data = Utils.extend(data || {}, defaultRoute);
			}

			var controllerData = getAction(request, response, data, classLoader);

			if (!controllerData) {
				controllerData = getAction(request, response, defaultRoute, classLoader);
			}

			if (!controllerData) {
				// To prevent infinite redirects when the default route is mis-specified.
				deferred.complete(false);
				return deferred;
			}

			var controller = controllerData.controller;
			var action = controllerData.action;

			var authenticatedActions = controller._authenticate;
			if (authenticatedActions) {
				var requestedActionIsAuthenticated = false;
				for (var i = authenticatedActions.length; i--;) {
					var authenticatedActionName = authenticatedActions[i];
					if (authenticatedActionName == action) {
						requestedActionIsAuthenticated = true;
					}
				}

				if (requestedActionIsAuthenticated && !authHandler.isAuthenticated(controller)) {
					deferred.complete({
						_redirect: loginUrl
					});

					return deferred;
				}
			}

			controller._promiseCallback = deferred.complete;
			var output = controller[action](data);

			if (output) {
				if (output instanceof Deferred) {
					output.onComplete(deferred.complete);
				} else {
					deferred.complete(output);
				}
			}

			return deferred;
		};
	};

	// Expose some methods for unit testing.
	ControllerHandler.redirect = redirect;
	ControllerHandler.getAction = getAction;

	return ControllerHandler;
})();