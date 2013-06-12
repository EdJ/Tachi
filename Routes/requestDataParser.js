var qs = require('querystring');

module.exports = (function() {
	return function RequestDataParser(parseUrl, parseFormData) {
		return function(request) {
			var url = request.url;

			var data = parseUrl(url);
			data = parseFormData(data);

			var deferred = new Deferred();

			if (!data || data._isStatic) {
				deferred.complete({
					_isStatic: true
				});

				return deferred;
			}

			data._method = request.method || 'GET';

			if (request.method !== 'POST') {
				deferred.complete(data);

				return deferred;
			}

			var body = '';
			request.on('data', function(fragment) {
				body += fragment;
				if (body.length > 1e6) {
					// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
					request.connection.destroy();
				}
			});

			request.on('end', function() {
				var postData = '';
				try {
					postData = JSON.parse(body);
				} catch (error) {
					postData = qs.parse(body);
					postData = parseFormData(postData);
				}

				data = Utils.extend(data, postData);

				deferred.complete(data);
			});

			return deferred;
		};
	};
})();