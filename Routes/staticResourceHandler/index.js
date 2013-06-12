var fs = require('fs');
var compressionHandler = require('../../Utilities/compressionHandler');
var ResourceHeaderGenerator = require('./resourceHeaderGenerator');
var ContentTypes = require('../../Utilities/mime');
var generateResourceHeaders = ResourceHeaderGenerator(AppRoot, ContentTypes, true);

var wasFileModified = function(requestHeaders, responseHeaders) {
    var modifiedDate = requestHeaders['if-modified-since'];
    var since = null;
    if (modifiedDate) {
        since = new Date(modifiedDate);
    }

    if (!since || since == 'Invalid Date') {
        return true;
    }

    var wasModified = true;

    if (responseHeaders['Last-Modified']) {
        var modified = responseHeaders['Last-Modified'];
        var lastModified = new Date(modified);
        wasModified = lastModified != 'Invalid Date' && lastModified > since;
    }

    return wasModified;
};

module.exports = function StaticResourceHandler(request, response) {
    var deferred = new Deferred();

    var path = request.url;

    var spl = path.split('.');
    var ext = spl[spl.length - 1];
    if (!ContentTypes[ext]) {
        deferred.complete(false);
        return deferred;
    }

    var filePath = AppRoot + path;

    generateResourceHeaders(filePath, ext)
        .onComplete(function(responseHeaders) {

        var wasModified = wasFileModified(request.headers, responseHeaders);

        if (!wasModified) {
            response.writeHead(304, responseHeaders);
            deferred.complete({
                _unmodified: true
            });

            return deferred;
        }

        fs.readFile(filePath, function(fileErr, fileData) {
            if (!fileErr) {
                var toCompress = {
                    toCompress: fileData,
                    headers: responseHeaders,
                    contentType: ContentTypes[ext]
                };

                deferred.complete(toCompress);
            } else {
                Logger.log(fileErr);

                deferred.complete(false);
            }
        });
    });

    return deferred;
};