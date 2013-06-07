var ContentTypes = require('../Utilities/mime');
var fs = require('fs');
var compression = require('../Utilities/compression');

module.exports = function StaticResourceHandler() {
    this.fileStats = {};
    this.rawCache = {};
    this.gzipCache = {};
    this.deflateCache = {};

    this.serve = function (request, resp, path) {
        var deferred = new Deferred();

        var contentTypes = ContentTypes;
        path = path || '.' + request.url;

        var spl = path.split('.');
        var ext = spl[spl.length - 1];
        if (!contentTypes[ext]) {
            deferred.complete(false);
            return deferred;
        }

        var modifiedDate = request.headers['if-modified-since'];
        var since = null;
        if (modifiedDate) {
            since = new Date(modifiedDate);
        }

        var headers = this.generateHeaders(path, ext);
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

        var isContentCompressable = compression.isContentCompressable(ext);

        var type = compression.checkHeaders(request);

        fs.readFile(AppRoot + path, function (fileErr, fileData) {
            if (!fileErr) {
                if (isContentCompressable && type) {
                    compression.adjustHeaders(headers, type);
                    var compressionDeferred = compression.compress(fileData, type);
                    compressionDeferred.onComplete(function (zipData) {
                        if (zipData.err) {
                            delete headers['Content-Encoding'];
                        }

                        resp.writeHead(200, headers);
                        resp.write(zipData.data);

                        deferred.complete(true);
                    });
                } else {
                    resp.writeHead(200, headers);
                    resp.write(fileData);

                    deferred.complete(true);
                }
            } else {
                Logger.log(fileErr);

                deferred.complete(false);
            }
        });

        return deferred;
    };

    this.generateHeaders = function (path, ext) {
        var contentTypes = ContentTypes;
        var headers = {};
        var fileStats = this.fileStats;
        var stats = fileStats[path];
        if (!stats) {
            stats = fs.statSync(AppRoot + path);
            fileStats[path] = stats;
        }

        var modified = new Date(stats.mtime);

        headers['Last-Modified'] = modified.toDateString();
        headers['Content-Type'] = contentTypes[ext];

        var expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 90);

        headers['Expires'] = expiresDate.toDateString();
        headers['Cache-control'] = 'public,max-age=3153600';

        return headers;
    };
};
