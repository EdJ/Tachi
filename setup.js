module.exports = function (settings) {
    Utils = require(settings.utils || 'Tachi/Utilities/utils');
    Logger = (function () {
        var baseLogger = require('Tachi/Logging/baseLogger');
        var logger = require(settings.logger || 'Tachi/Logging/consoleLogger');
        baseLogger(logger);

        return logger;
    })();
    ClassLoader = require('Tachi/classLoader');
    JsonBase = require('Tachi/Repositories/jsonBase');
    Html = require('Tachi/Utilities/html');
    AppRoot = settings.appRoot;
    ComplexObjectParser = require('Tachi/Utilities/complexObjectParser');
    Deferred = require('Tachi/Async/deferred');
    AuthHandler = require('Tachi/Auth/authHandler');
    Cookie = require('Tachi/Utilities/cookie');
};
