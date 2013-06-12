module.exports = function (settings) {
    Utils = require(settings.utils || 'tachi/Utilities/utils');
    Logger = (function () {
        var baseLogger = require('tachi/Logging/baseLogger');
        var logger = require(settings.logger || 'tachi/Logging/consoleLogger');
        baseLogger(logger);

        return logger;
    })();
    ClassLoader = require('tachi/classLoader');
    Repository = require(settings.repository || 'tachi/Repositories/jsonRepository')(settings.connectionDetails);
    Html = require('tachi/Utilities/html');
    AppRoot = settings.appRoot;

    // TODO: This syntax is not ideal...
    ComplexObjectParser = require('tachi/FormParser');
    
    Deferred = require('tachi/Async/deferred');
    AuthHandler = require('tachi/Auth/authHandler');

    // TODO: ...and again.
    var cookie = require('tachi/Utilities/cookie');
    Cookie = new cookie();
};
