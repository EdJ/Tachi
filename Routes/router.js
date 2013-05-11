var compression = require('../Utilities/compression');
var qs = require('querystring');
var authHandler = require('../Auth/authHandler');

module.exports = (function () {
    return function Router(routes, statics, settings) {
        var RouteParser = require(settings.routeParser || './routeParser');
        var StaticResourceHandler = require(settings.staticResourceHandler || './staticResourceHandler');

        var routeParser = new RouteParser(routes, statics);
        var staticResourceHandler = new StaticResourceHandler();

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

        this.toController = function (req, res, data, callback, failedPreviously) {
            if (!data || !data.controller) {
                data = Utils.extend(data || {}, defaultRoute);
            }

            var controller = ClassLoader.getController(data.controller, req, res);
            var action = (data.action || 'index').toLowerCase();

            var onCallback = function (output) {
                if (output._redirect) {
                    redirect(output._redirect, res);
                    return;
                }

                var headers = { 'Content-Type': 'text/html; charset=UTF-8' };

                var type = compression.checkHeaders(req, 'html');

                var finaliseRequest = function (data) {
                    res.writeHead(200, headers);
                    res.write(data);

                    process.nextTick(function () {
                        callback(true);
                    });
                };

                if (!type) {
                    finaliseRequest(data);
                }

                var deferred = compression.compress(output, type);

                deferred.onComplete(function (zipData) {
                    if (!zipData.error) {
                        compression.adjustHeaders(headers, type);
                    }

                    finaliseRequest(zipData.data);
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
                            return;
                        }
                    }

                    controller._promiseCallback = onCallback;
                    var output = controller[action](data);

                    if (output) {
                        process.nextTick(function () {
                            onCallback(output);
                        });
                    }

                    return;
                }
            }

            if (failedPreviously) {
                // To prevent infinite redirects when the default route is mis-specified.
                process.nextTick(function () {
                    var output = Html.View('Error', { title: 'Could not find route.', message: 'The requested route does not exist.' });
                    onCallback(output);
                });

                return;
            }

            thisReference.toController(req, res, defaultRoute, callback, true);
        };

        this.dispatch = function (req, res) {
            var deferred = new Deferred();
            var url = req.url;

            var data = routeParser.parse(url);
            data = ComplexObjectParser.parse(data);

            if (!data || data._isStatic) {
                var resourseHandlerDeferred = staticResourceHandler.serve(req, res, req.url);

                resourseHandlerDeferred.onComplete(deferred.complete);
                return deferred;
            }

            data._method = req.method;

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

                    thisReference.toController(req, res, data, deferred.complete);
                });
            } else {
                thisReference.toController(req, res, data, deferred.complete);
            }

            return deferred;
        };

        this.getActionLink = function (params) {
            return routeParser.getUrl(params);
        };
    };
})();
