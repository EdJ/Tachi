var http = require('http');

module.exports = (function () {
    return function TachiHandler(settings, routes) {
        (require('./setup.js'))(settings);

        Logger.log('Setup Complete.');
        Router = new (require('tachi/Routes/router'))(routes.routes, routes.statics, settings);

        var failedRequest = function (res) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.write('There was an error processing the request.');
            res.end();
        };

        var getClientIp = function (req) {
            var ip = req.headers['x-forwarded-for'];
            if (!ip) {
                ip = req.connection.remoteAddress;
            }

            return ip;
        };

        var server = http.createServer(function (req, res) {
            var ip = getClientIp(req);
            var start = new Date();
            Logger.log('Incoming request from ' + ip + '. (' + req.url + ')');

            try {
                var routerDeferred = Router.dispatch(req, res);

                routerDeferred.onComplete(function (success) {
                    if (!success) {
                        Logger.log('Routing failed. (' + req.url + ')');
                        failedRequest(res);
                    }

                    Logger.log('Response ended');
                    Logger.log('Transaction Timing: ' + req.url + ' :: ' + (new Date() - start) + 'ms');
                    res.end();
                });
            } catch (err) {
                Logger.log('Response failed');
                Logger.log(err);
                failedRequest(res);
            }
        });

        var port = settings.port || 80;

        var stopFunc = this.stop = function () {
            Logger.log('Closing Tachi server');

            server.close();
            Logger.log('Teardown complete.');
        };

        this.start = function () {
            server.listen(port);

            // Needs replacing with something a little more robust. 
            process.on('uncaughtException', function (err) {
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
