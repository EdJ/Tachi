var baseLogger = {
    Status: {
            Message: 'Message',
            Warning: 'Warning',
            Error: 'Error'
    }
};

module.exports = function(logger) {
    Utils.extend(logger, baseLogger);
};
