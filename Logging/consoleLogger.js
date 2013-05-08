module.exports = (function() {
    var logMessage = function(msg) {
        process.stdout.write(new Date() + '| ');
        console.log(msg);
    };

    var lg = {
        status : {},
        getPrefix: function(s) {
            switch (s) {
                case lg.Status.Error:
                    return 'ERROR: ';
                case lg.Status.Warning:
                    return 'Warning: ';
                default:
                    return '';
            }
        },
        log: function(msg) {
            if (!msg) {
                logMessage('Invalid message passed to logger.');
                return;
            }

            var s = msg.Status || lg.Status.Message;
            msg = (msg.message || msg);
            var l = msg.length;

            if (l && msg instanceof Array) {
                for (var i = 0 ; i < l; i++ ) {
                    logMessage(msg[i]);
                }
            } else {
                var prefix = lg.getPrefix(s);
                logMessage(prefix + msg);
            }
        }
    };

    return lg;
})();

