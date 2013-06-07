var zlib = require('zlib');
var Deferred = require('../Async/deferred');

module.exports = (function () {
    var compress = function (data, type) {
        var toCall;
        if (type == 'deflate') {
            toCall = zlib.deflate;
        } else {
            toCall = zlib.gzip;
        }

        var deferred = new Deferred();

        toCall(data, function (error, zipData) {
            var toReturn = error ? data : zipData;

            deferred.complete({
                error: error,
                data: toReturn
            });
        });

        return deferred;
    };

    var compressable = ['js', 'css', 'htm', 'html'];

    var isContentCompressable = function (ext) {
        return !! ~compressable.indexOf(ext) || /json|text|javascript/.test(ext);
    };

    var checkHeaders = function (request, ext) {
        var acceptEncoding = request.headers['accept-encoding'] || '';

        var type = '';
        if (acceptEncoding.match(/\*/) || acceptEncoding.match(/\bdeflate\b/)) {
            type = 'deflate';
        } else if (acceptEncoding.match(/\bgzip\b/)) {
            type = 'gzip';
        }

        return type;
    };

    var adjustHeaders = function (headers, type) {
        headers['Vary: Accept-Encoding'] = 'gzip, deflate';
        if (type == 'deflate') {
            headers['Content-Encoding'] = 'deflate';
        } else {
            headers['Content-Encoding'] = 'gzip';
        }
    };

    return {
        compress: compress,
        checkHeaders: checkHeaders,
        isContentCompressable: isContentCompressable,
        adjustHeaders: adjustHeaders
    };
})();