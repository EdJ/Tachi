var compression = require('../Utilities/compression');
var qs = require('querystring');
var authHandler = require('../Auth/authHandler');

module.exports = (function () {
    return function Router(routes, statics, settings) {
        var RouteParser = require(settings.routeParser || './routeParser');
        var StaticResourceHandler = require(settings.staticResourceHandler || './staticResourceHandler');

        var router = new RouteParser(routes, statics);
        var staticResourceHandler = new StaticResourceHandler();

        var defaultUrl = settings.defaultRoute || '/';
        var defaultRoute = router.parse(defaultUrl);

        var loginUrl = settings.defaultRoute || '/Login';
        var loginRoute = router.parse(loginUrl);

        this.toController = function (req, res, data, callback, failedPreviously) {
            if (!data || !data.controller) {
                data = Utils.extend(data || {}, defaultRoute);
            }

            var controller = ClassLoader.getController(data.controller, req, res);
            var action = (data.action || 'index').toLowerCase();

            var onCallback = function (output) {
                if (output._redirect) {
                    res.writeHead(302, {
                      'Location': output._redirect
                    });

                    res.end();
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

                compression.compress(output, type, function (err, zipData) {
                    if (!err) {
                        compression.adjustHeaders(headers, type);
                    }

                    finaliseRequest(zipData);
                });
            };

            if (controller && controller[action]) {
                if (controller._authenticate && controller._authenticate[action]) {
                    if (!authHandler.isAuthenticated(controller)) {
                        this.toController(req, res, loginRoute, callback, true);
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

            if (failedPreviously) {
                // To prevent infinite redirects when the default route is mis-specified.
                process.nextTick(function () {
                    var output = Html.View('Error', { title: 'Could not find route.', message: 'The requested route does not exist.' });
                    onCallback(output);
                });

                return;
            }

            this.toController(req, res, defaultRoute, callback, true);
        };

        this.dispatch = function (req, res, callback) {
            var url = req.url;

            var data = router.parse(url);
            data = ComplexObjectParser.parse(data);

            if (!data || data._isStatic) {
                staticResourceHandler.serve(req, res, req.url, callback);
                return;
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

                    this.toController(req, res, data, callback);
                });
            } else {
                this.toController(req, res, data, callback);
            }
        };

        this.getActionLink = function (params) {
            return router.getUrl(params);
        };
    };
})();
