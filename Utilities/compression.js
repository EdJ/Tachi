var zlib = require('zlib');

module.exports = (function () {
    var compress = function (data, type, callback) {
        var toCall;
        if (type == 'deflate') {
            toCall = zlib.deflate;
        } else {
            toCall = zlib.gzip;
        }

        toCall(data, function (err, zipData) {
            var toReturn;

            if (err) {
                toReturn = data;
            } else {
                toReturn = zipData;
            }

            process.nextTick(function () {
                callback(err, toReturn);
            });
        });
    };

    var compressable = ['js', 'css', 'htm', 'html'];

    var isContentCompressable = function (ext) {
        return !! ~compressable.indexOf(ext);
    };

    var checkHeaders = function (request, ext) {
        var acceptEncoding = request.headers['accept-encoding'] || '';

        var isCompressable = isContentCompressable(ext);

        var type;
        if (isCompressable && (acceptEncoding.match(/\*/) || acceptEncoding.match(/\bdeflate\b/))) {
            type = 'deflate';
        } else if (isCompressable && acceptEncoding.match(/\bgzip\b/)) {
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
        adjustHeaders: adjustHeaders
    };
})();