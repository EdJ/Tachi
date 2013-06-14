var CreateRequestDataParser = require('./requestDataParser');
var CreateControllerHandler = require('./controllerHandler');
var staticResourceHandler = require('./staticResourceHandler');

module.exports = (function() {
    var redirect = function(response, location) {
        response.writeHead(302, {
            'Location': location
        });
    };

    var Router = function Router(routeData, classLoader) {
        var parseRequestData = CreateRequestDataParser(routeData);
        var getControllerData = CreateControllerHandler(routeData.defaultRoute, routeData.loginUrl, classLoader);

        return function(request, response) {
            var deferred = new Deferred();

            parseRequestData(request)
                .onComplete(function(requestData) {
                if (requestData._isStatic) {
                    staticResourceHandler(request, response)
                        .onComplete(deferred.complete);
                    return;
                }

                getControllerData(request, response, requestData)
                    .onComplete(function(output) {
                    if (output._redirect) {
                        redirect(response, output._redirect);
                    }

                    if (output instanceof Deferred) {
                        output.onComplete(deferred.complete);
                        return;
                    }

                    deferred.complete(output);
                });
            });

            return deferred;
        };
    };

    Router.redirect = redirect;

    return Router;
})();