var fs = require('fs');

module.exports = (function() {
	return function ResourceHeaderGenerator(appRoot, contentTypes, specifyCacheHeaders) {
		var fileStats = {};

		var setFileSpecificHeaders = function (existingHeaders, specifyCacheHeaders, lastModifiedTime) {
			var modified = new Date(lastModifiedTime);

			existingHeaders['Last-Modified'] = modified.toString();

			if (!specifyCacheHeaders) {
				return existingHeaders;
			}

			var expiresDate = new Date();
			expiresDate.setDate(expiresDate.getDate() + 90);

			existingHeaders['Expires'] = expiresDate.toString();
			existingHeaders['Cache-control'] = 'public,max-age=3153600';

			return existingHeaders;
		}

		return function(path, extension) {
			var deferred = new Deferred();

			var headers = {};
			headers['Content-Type'] = contentTypes[extension];

			var stats = fileStats[path];
			if (!stats) {
				fs.stat(appRoot + path, function (err, stats) {
					if (err) {
						deferred.complete(headers);
						return;
					}

					fileStats[path] = stats;

					headers = setFileSpecificHeaders(headers, specifyCacheHeaders, stats.mtime);

					deferred.complete(headers);
				});

				return deferred;
			}

			headers = setFileSpecificHeaders(headers, stats.mtime);

			deferred.complete(headers);

			return deferred;
		};
	};
})();