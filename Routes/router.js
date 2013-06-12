var qs = require('querystring');
var parseRoute = require('./routeParser');
var CreateRouteFinder = require('./routeFinder');
var CreateUrlParser = require('./urlParser');
var CreateRequestDataParser = require('./requestDataParser');
var CreateControllerHandler = require('./controllerHandler');
var compressionHandler = require('../Utilities/compressionHandler');

module.exports = (function() {
    var redirect = function(response, location) {
        response.writeHead(302, {
            'Location': location
        });

        response.end();
    };

    return function Router(routes, statics, settings) {
        var staticResourceHandler = require('./staticResourceHandler');

        var parsedRoutes = [];
        routes.forEach(function(route) {
            var parsedRoute = parseRoute(route);
            parsedRoutes.push(parsedRoute);
        });

        var defaultUrl = settings.defaultRoute || '/';
        var defaultRoute = parseRoute(defaultUrl);

        var loginUrl = settings.loginUrl || '/Login';

        var parseUrl = CreateUrlParser(parsedRoutes, statics);
        var parseRequestData = CreateRequestDataParser(parseUrl, ComplexObjectParser);

        var getControllerData = CreateControllerHandler(defaultRoute, loginUrl, ClassLoader);

        this.dispatch = function(request, response) {
            var deferred = new Deferred();

            parseRequestData(request)
                .onComplete(function(requestData) {
                if (requestData._isStatic) {
                    staticResourceHandler(request, response)
                        .onComplete(function(output) {
                        if (!output || output._unmodified) {
                            deferred.complete(output);
                            return;
                        }

                        compressionHandler(request, response, output)
                            .onComplete(function() {
                            deferred.complete(true);
                        });
                    });
                    return;
                }

                getControllerData(request, response, requestData)
                    .onComplete(function(output) {
                    if (!output) {
                        output = Html.View('Error', {
                            title: 'Could not find route.',
                            message: 'The requested route does not exist.'
                        });
                    }

                    if (output._redirect) {
                        redirect(output._redirect, res);
                        deferred.complete(true);
                        return;
                    }

                    compressionHandler(request, response, output)
                        .onComplete(function() {
                        deferred.complete(true);
                    });
                });
            });

            return deferred;
        };

        // This needs refactoring out, it shouldn't be here.
        var findRoute = CreateRouteFinder(parsedRoutes);

        this.getActionLink = function(params) {
            return findRoute(params);
        };
    };
})();