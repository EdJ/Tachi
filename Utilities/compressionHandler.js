var compression = require('./compression');

module.exports = (function () {
	var completeWithoutCompressing = function (response, data) {
	 	var deferred = new Deferred();

        response.writeHead(200, data.headers);
        response.write(data.toCompress);

        deferred.complete({
        	compressedData: false
        });

	 	return deferred;
	};

	var completeWithCompression = function (response, data) {
		var deferred = new Deferred();

        compression.compress(data.toCompress, data.contentType)
        .onComplete(function (compressedData) {
        	var dataToWrite = data.toCompress;
            if (!compressedData.error) {
                compression.adjustHeaders(data.headers, data.contentType);
                dataToWrite = compressedData.compressedData;
            }

	        response.writeHead(200, data.headers);
	        response.write(dataToWrite);

	        deferred.complete({
	        	compressedData: !compressedData.error
	        })
        });

        return deferred;
	};

	return function (request, response, data) {
		if (!data.toCompress) {
			data = {
				toCompress: data
			};
		}

		data.contentType = data.contentType || 'text/html';
		data.headers = data.headers || { 'Content-Type': 'text/html' };

		if (!request) {
			return completeWithoutCompressing(response, data);
		}

		var compressionType = compression.checkHeaders(request);

		if (!compressionType) {
			return completeWithoutCompressing(response, data);
		}

		var isContentCompressable = compression.isContentCompressable(data.contentType);

		if (!isContentCompressable) {
			return completeWithoutCompressing(response, data);
		}

		return completeWithCompression(response, data);
	};
})();