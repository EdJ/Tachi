module.exports = function (settings) {
    Utils = require('./Utilities/utils');
    Logger = (function () {
        var baseLogger = require('tachi/Logging/baseLogger');
        var logger = require(settings.logger || 'tachi/Logging/consoleLogger');
        baseLogger(logger);

        return logger;
    })();
    
    Repository = require(settings.repository || 'tachi/Repositories/jsonRepository')(settings.connectionDetails);
    AppRoot = settings.appRoot || __dirname + '/../../';
    
    Deferred = require('tachi/Async/deferred');
};
