var proxyquire = require('proxyquire').noCallThru();

// This shouldn't really be defined as a global.
AppRoot = './';
Logger = {
	log: function() {}
}

describe('staticResourceHandler', function() {
	var getResourceHeaderGenerator = function(headersToReturn) {
		return function() {
			return function() {
				var deferred = new Deferred();

				deferred.complete(headersToReturn);

				return deferred;
			}
		}
	};

	it('should do nothing for a missing content type.', function(done) {
		var staticResourceHandler = proxyquire('../../../Routes/staticResourceHandler', {
			'../../Utilities/mime': {
				html: 'text/html'
			}
		});

		var resultDeferred = staticResourceHandler({
			url: 'fakepath'
		});

		resultDeferred.onComplete(function(result) {
			result.should.be.false;

			done();
		});
	});

	it('should do nothing for an unknown content type.', function(done) {
		var staticResourceHandler = proxyquire('../../../Routes/staticResourceHandler', {
			'../../Utilities/mime': {
				html: 'text/html'
			}
		});

		var resultDeferred = staticResourceHandler({
			url: 'fakepath.js'
		});

		resultDeferred.onComplete(function(result) {
			result.should.be.false;

			done();
		});
	});

	it('should not write an output for a non-modified file.', function(done) {
		var modifiedTime = 1370950288894;
		var modifiedTimePlusNinetyDays = 1378726288894;

		var headersToReturn = {
			'fakeHeaders': 'test',
			'Last-Modified': modifiedTime
		};

		var staticResourceHandler = proxyquire('../../../Routes/staticResourceHandler', {
			'../../Utilities/mime': {
				html: 'text/html'
			},
			'./resourceHeaderGenerator': getResourceHeaderGenerator(headersToReturn)
		});

		var responseHeaders;
		var responseCode;

		var resultDeferred = staticResourceHandler({
			url: 'fakepath.html',
			headers: {
				'if-modified-since': modifiedTimePlusNinetyDays
			}
		}, {
			writeHead: function(code, headers) {
				responseHeaders = headers;
				responseCode = code;
			}
		});

		resultDeferred.onComplete(function(result) {
			result.should.eql({
				_unmodified: true
			});

			responseHeaders.should.equal(headersToReturn);
			responseCode.should.equal(304);

			done();
		});
	});

	it('should write nothing for a modified file that cannot be read.', function(done) {
		var modifiedTime = 1378726288894;
		var modifiedTimeMinusNinetyDays = 1370950288894;

		var headersToReturn = {
			'fakeHeaders': 'test',
			'Last-Modified': modifiedTime
		};

		var staticResourceHandler = proxyquire('../../../Routes/staticResourceHandler', {
			'../../Utilities/mime': {
				html: 'text/html'
			},
			'./resourceHeaderGenerator': getResourceHeaderGenerator(headersToReturn),
			'fs': {
				readFile: function(path, callback) {
					callback('ERROR!', null);
				}
			}
		});

		var resultDeferred = staticResourceHandler({
			url: 'fakepath.html',
			headers: {
				'if-modified-since': modifiedTimeMinusNinetyDays
			}
		}, {});

		resultDeferred.onComplete(function(result) {
			result.should.be.false;

			done();
		});
	});

	it('should pass the write across to the compression handler for a modified file.', function(done) {
		var modifiedTime = 1378726288894;
		var modifiedTimeMinusNinetyDays = 1370950288894;

		var headersToReturn = {
			'fakeHeaders': 'test',
			'Last-Modified': modifiedTime
		};

		var staticResourceHandler = proxyquire('../../../Routes/staticResourceHandler', {
			'../../Utilities/mime': {
				html: 'text/html'
			},
			'./resourceHeaderGenerator': getResourceHeaderGenerator(headersToReturn),
			'fs': {
				readFile: function(path, callback) {
					callback(null, 'File data.');
				}
			},
			'../../Utilities/compressionHandler': function() {
				var deferred = new Deferred();

				deferred.complete();

				return deferred;
			}
		});

		var resultDeferred = staticResourceHandler({
			url: 'fakepath.html',
			headers: {
				'if-modified-since': modifiedTimeMinusNinetyDays
			}
		}, {});

		resultDeferred.onComplete(function(result) {
			result.should.eql({
                    toCompress: 'File data.',
                    headers: headersToReturn,
                    contentType: 'text/html'
			});

			done();
		});
	});
});