var fs = require('fs');
var compressionHandler = require('../../Utilities/compressionHandler');
var ResourceHeaderGenerator = require('./resourceHeaderGenerator');
var ContentTypes = require('../../Utilities/mime');
var generateResourceHeaders = ResourceHeaderGenerator(AppRoot, ContentTypes, true);

module.exports = function StaticResourceHandler() {
    this.serve = function (request, resp) {
        var deferred = new Deferred();

        var path = request.url;

        var spl = path.split('.');
        var ext = spl[spl.length - 1];
        if (!ContentTypes[ext]) {
            deferred.complete(false);
            return deferred;
        }

        var modifiedDate = request.headers['if-modified-since'];
        var since = null;
        if (modifiedDate) {
            since = new Date(modifiedDate);
        }

        var headersDeferred = generateResourceHeaders(path, ext);
        headersDeferred.onComplete(function (headers) {
            var wasModified = true;

            if (headers['Last-Modified'] && since) {
                var modified = headers['Last-Modified'];
                var lastModified = new Date(modified);
                wasModified = lastModified > since;
            }

            if (!wasModified) {
                resp.writeHead(304, headers);
                deferred.complete(true);
                return deferred;
            }

            fs.readFile(AppRoot + path, function (fileErr, fileData) {
                if (!fileErr) {
                    var toCompress = {
                        toCompress: fileData,
                        headers: headers,
                        contentType: ContentTypes[ext]
                    };

                    compressionHandler(request, resp, toCompress)
                    .onComplete(function () {
                        deferred.complete(true);
                    });
                } else {
                    Logger.log(fileErr);

                    deferred.complete(false);
                }
            });
        });

        return deferred;
    };
};
