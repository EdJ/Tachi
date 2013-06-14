var http = require('http');
var compressionHandler = require('./Utilities/compressionHandler');
var parseRoutes = require('./RouteParser');
var RouteFinder = require('./RouteFinder');
var ClassLoader = require('./classLoader');
var BaseController = require('./baseController');
var SetupGlobals = require('./setup.js');

module.exports = (function() {
    return function TachiHandler(settings, routes) {
        SetupGlobals(settings);

        Logger.log('Setup Complete.');

        var parsedRoutes = parseRoutes(routes);

        var findRoute = new RouteFinder(parsedRoutes);
        var baseController = new BaseController(findRoute);
        var classLoader = new ClassLoader(baseController);

        Html = require('tachi/Utilities/html')(baseController);

        var Router = require('./Router');
        var routeRequest = new Router(parsedRoutes, classLoader);

        var failedRequest = function(res) {
            res.writeHead(404, {
                'Content-Type': 'text/html; charset=UTF-8'
            });

            res.write('There was an error processing the request.');
        };

        var getClientIp = function(req) {
            var ip = req.headers['x-forwarded-for'];
            if (!ip) {
                ip = req.connection.remoteAddress;
            }

            return ip;
        };

        var server = http.createServer(function(req, res) {
            var ip = getClientIp(req);
            var start = new Date();
            Logger.log('Incoming request from ' + ip + '. (' + req.url + ')');

            try {
                var routerDeferred = routeRequest(req, res);

                routerDeferred.onComplete(function(output) {
                    if (!output) {
                        Logger.log('Routing failed. (' + req.url + ')');
                        failedRequest(res);
                    } else if (output !== true && !(output._unmodified || output._redirect)) {
                        compressionHandler(req, res, output)
                            .onComplete(function() {
                            Logger.log('Response ended');
                            Logger.log('Transaction Timing: ' + req.url + ' :: ' + (new Date() - start) + 'ms');
                            res.end();
                        });

                        return;
                    }

                    Logger.log('Response ended');
                    Logger.log('Transaction Timing: ' + req.url + ' :: ' + (new Date() - start) + 'ms');
                    res.end();
                });
            } catch (err) {
                Logger.log('Response failed');
                Logger.log(err);
                Logger.log(err.stack);
                failedRequest(res);
            }
        });

        var port = settings.port || 80;

        var stopFunc = this.stop = function() {
            Logger.log('Closing Tachi server');

            server.close();
            Logger.log('Teardown complete.');
        };

        this.start = function() {
            server.listen(port);

            // Needs replacing with something a little more robust. 
            process.on('uncaughtException', function(err) {
                Logger.log('Unhandled exception occured: ');

                if (err.message) {
                    Logger.log('\nMessage: ' + err.message)
                }
                if (err.stack) {
                    Logger.log('\nStacktrace:')
                    Logger.log('====================')
                    Logger.log(err.stack);
                }

                Logger.log('Exception handled, resuming');
            });
        };
    };
})();