var qs = require('querystring');
var authHandler = require('../Auth/authHandler');
var compressionHandler = require('../Utilities/compressionHandler');

module.exports = (function () {
    return function Router(routes, statics, settings) {
        var RouteParser = require(settings.routeParser || './routeParser');
        var staticResourceHandler = require(settings.staticResourceHandler || './staticResourceHandler');

        var routeParser = new RouteParser(routes, statics);
        
        var defaultUrl = settings.defaultRoute || '/';
        var defaultRoute = routeParser.parse(defaultUrl);

        var loginUrl = settings.loginUrl || '/Login';

        var thisReference = this;

        var redirect = function (location, res) {
            res.writeHead(302, {
              'Location': location
            });

            res.end();
        };

        this.toController = function (req, res, data, failedPreviously) {
            var deferred = new Deferred();

            if (!data || !data.controller) {
                data = Utils.extend(data || {}, defaultRoute);
            }

            var controller = ClassLoader.getController(data.controller, req, res);
            var action = (data.action || 'index').toLowerCase();

            var onCallback = function (output) {
                if (output._redirect) {
                    redirect(output._redirect, res);
                    deferred.complete(true);
                    return;
                }

                compressionHandler(req, res, output)
                .onComplete(function () {
                    deferred.complete(true);
                });
            };

            if (controller) {
                var toCall = null;
                if (data._method === 'POST' && controller[action + '_post']) {
                    action = action + '_post';
                }

                if (controller[action]) {
                    if (controller._authenticate && controller._authenticate[action]) {
                        if (!authHandler.isAuthenticated(controller)) {
                            redirect(loginUrl, res);
                            deferred.complete(true);
                            return deferred;
                        }
                    }

                    controller._promiseCallback = onCallback;
                    var output = controller[action](data);

                    if (output) {
                        onCallback(output);
                    }

                    return deferred;
                }
            }

            if (failedPreviously) {
                // To prevent infinite redirects when the default route is mis-specified.
                var output = Html.View('Error', { title: 'Could not find route.', message: 'The requested route does not exist.' });
                onCallback(output);
                return deferred;
            }

            return thisReference.toController(req, res, defaultRoute, true);
        };

        this.dispatch = function (req, res) {
            var url = req.url;

            var data = routeParser.parse(url);
            data = ComplexObjectParser.parse(data);

            if (!data || data._isStatic) {
                return staticResourceHandler(req, res, req.url);
            }

            data._method = req.method;

            var deferred = new Deferred();

            if (req.method == 'POST') {
                var body = '';
                req.on('data', function (fragment) {
                    body += fragment;
                    if (body.length > 1e6) {
                        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                        req.connection.destroy();
                    }
                });
                req.on('end', function () {
                    var postData = '';
                    try {
                        postData = JSON.parse(body);
                    } catch (error) {
                        postData = qs.parse(body);
                        postData = ComplexObjectParser.parse(postData);
                    }

                    data = Utils.extend(data, postData);

                    thisReference.toController(req, res, data).onComplete(deferred.complete);
                });

                return deferred;
            } else {
                return thisReference.toController(req, res, data);
            }
        };

        this.getActionLink = function (params) {
            return routeParser.getUrl(params);
        };
    };
})();
