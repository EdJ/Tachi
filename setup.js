module.exports = function (settings) {
    Utils = require(settings.utils || 'tachi/Utilities/utils');
    Logger = (function () {
        var baseLogger = require('tachi/Logging/baseLogger');
        var logger = require(settings.logger || 'tachi/Logging/consoleLogger');
        baseLogger(logger);

        return logger;
    })();
    ClassLoader = require('tachi/classLoader');
    Repository = require(settings.repository || 'tachi/Repositories/jsonRepository'))(settings.connectionDetails);
    Html = require('tachi/Utilities/html');
    AppRoot = settings.appRoot;
    ComplexObjectParser = require('tachi/Utilities/complexObjectParser');
    Deferred = require('tachi/Async/deferred');
    AuthHandler = require('tachi/Auth/authHandler');
    Cookie = require('tachi/Utilities/cookie');
};
