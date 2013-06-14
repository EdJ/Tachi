var proxyquire = require('proxyquire');

describe('RequestDataParser', function() {
	it('should return an object with only the _isStatic property for a static URL.', function(done) {

		var parseUrl = function() {
			return {
				_isStatic: true
			};
		};

		var parseFormData = function(data) {
			return data;
		};

		var requestDataParser = proxyquire('../../Router/requestDataParser',
			{
				'tachi/FormParser': parseFormData,
				'./urlParser': function () { return parseUrl; }
			});

		var parseDataFunction = requestDataParser({});

		var deferred = parseDataFunction({
			url: '/test'
		});

		deferred.onComplete(function(result) {
			result.should.eql({
				_isStatic: true
			});

			done();
		});
	});

	it('should return the data from the form parser if the request is not a post.', function(done) {
		var parseUrl = function() {
			return {
				controller: 'test',
				action: 'test2'
			};
		};

		var parseFormData = function(data) {
			data.queryStringData = 'was parsed.';

			return data;
		};

		var requestDataParser = proxyquire('../../Router/requestDataParser',
			{
				'tachi/FormParser': parseFormData,
				'./urlParser': function () { return parseUrl; }
			});

		var parseDataFunction = requestDataParser({});

		var deferred = parseDataFunction({
			url: '/test'
		});

		deferred.onComplete(function(result) {
			result.should.eql({
				controller: 'test',
				action: 'test2',
				queryStringData: 'was parsed.',
				_method: 'GET'
			});

			done();
		});
	});

	it('should parse the form body if the request is a post.', function(done) {
		var parseUrl = function() {
			return {
				controller: 'test',
				action: 'test2'
			};
		};

		var parseFormData = function(data) {
			data.queryStringData = 'was parsed.';

			return data;
		};

		var requestDataParser = proxyquire('../../Router/requestDataParser',
			{
				'tachi/FormParser': parseFormData,
				'./urlParser': function () { return parseUrl; }
			});

		var parseDataFunction = requestDataParser({});

		var requestDataCallback;
		var requestEndCallback;

		var fakeOnFunction = function(type, callback) {
			if (type === 'data') {
				requestDataCallback = callback;
				return;
			}

			requestEndCallback = callback;
		}

		var deferred = parseDataFunction({
			url: '/test',
			method: 'POST',
			on: fakeOnFunction
		});

		deferred.onComplete(function(result) {
			result.should.eql({
				controller: 'test',
				action: 'test2',
				queryStringData: 'was parsed.',
				formData: 'yes',
				_method: 'POST'
			});

			done();
		});

		requestDataCallback('formData=yes');

		requestEndCallback();
	});

	it('should parse the form body if the request is a post and has multiple segments.', function(done) {
		var parseUrl = function() {
			return {
				controller: 'test',
				action: 'test2'
			};
		};

		var parseFormData = function(data) {
			data.queryStringData = 'was parsed.';

			return data;
		};

		var requestDataParser = proxyquire('../../Router/requestDataParser',
			{
				'tachi/FormParser': parseFormData,
				'./urlParser': function () { return parseUrl; }
			});

		var parseDataFunction = requestDataParser({});

		var requestDataCallback;
		var requestEndCallback;

		var fakeOnFunction = function(type, callback) {
			if (type === 'data') {
				requestDataCallback = callback;
				return;
			}

			requestEndCallback = callback;
		}

		var deferred = parseDataFunction({
			url: '/test',
			method: 'POST',
			on: fakeOnFunction
		});

		deferred.onComplete(function(result) {
			result.should.eql({
				controller: 'test',
				action: 'test2',
				queryStringData: 'was parsed.',
				formData: 'yes',
				_method: 'POST'
			});

			done();
		});

		requestDataCallback('formDat');
		requestDataCallback('a=yes');

		requestEndCallback();
	});

	it('should parse the form body if the request is a post the post body is JSON.', function(done) {
		var parseUrl = function() {
			return {
				controller: 'test',
				action: 'test2'
			};
		};

		var parseFormData = function(data) {
			data.queryStringData = 'was parsed.';

			return data;
		};

		var requestDataParser = proxyquire('../../Router/requestDataParser',
			{
				'tachi/FormParser': parseFormData,
				'./urlParser': function () { return parseUrl; }
			});

		var parseDataFunction = requestDataParser({});

		var requestDataCallback;
		var requestEndCallback;

		var fakeOnFunction = function(type, callback) {
			if (type === 'data') {
				requestDataCallback = callback;
				return;
			}

			requestEndCallback = callback;
		}

		var deferred = parseDataFunction({
			url: '/test',
			method: 'POST',
			on: fakeOnFunction
		});

		deferred.onComplete(function(result) {
			result.should.eql({
				controller: 'test',
				action: 'test2',
				queryStringData: 'was parsed.',
				jsonData: 'hello',
				_method: 'POST'
			});

			done();
		});

		requestDataCallback('{"jsonData":"hello"}');

		requestEndCallback();
	});
});