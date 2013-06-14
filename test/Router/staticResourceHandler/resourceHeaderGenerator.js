var proxyquire = require('proxyquire');
var originalDate = Date;

describe('resourceHeaderGenerator', function() {
	var contentTypes = {
		'test': 'test/test'
	};

	it('should respond with the correct content type.', function(done) {
		var modifiedTime = 1370950288894;
		var fs = {
			stat: function(path, callback) {
				callback(null, {
					mtime: modifiedTime
				});
			}
		};

		var ResourceHeaderGenerator = proxyquire('../../../Router/staticResourceHandler/resourceHeaderGenerator', {
			fs: fs
		});

		// Don't specify the cache headers.
		var generateContentHeaders = ResourceHeaderGenerator(contentTypes, false);

		var deferred = generateContentHeaders('test.test', 'test');

		deferred.onComplete(function(resultHeaders) {
			resultHeaders.should.have.property('Content-Type');
			resultHeaders['Content-Type'].should.equal('test/test');

			done();
		});
	});

	it('should always set the Last-Modified header if it can read the file stats.', function(done) {
		var modifiedTime = 1370950288894;
		var fs = {
			stat: function(path, callback) {
				callback(null, {
					mtime: modifiedTime
				});
			}
		};

		var expectedLastModifiedDate = new Date(modifiedTime).toString();

		var ResourceHeaderGenerator = proxyquire('../../../Router/staticResourceHandler/resourceHeaderGenerator', {
			fs: fs
		});

		// Don't specify the cache headers.
		var generateContentHeaders = ResourceHeaderGenerator(contentTypes, false);

		var deferred = generateContentHeaders('test.test', 'test');

		deferred.onComplete(function(resultHeaders) {
			resultHeaders.should.have.property('Last-Modified');
			resultHeaders['Last-Modified'].should.equal(expectedLastModifiedDate);

			done();
		});
	});

	it('should not set the file-specific headers if the file stats cannot be read.', function(done) {
		var modifiedTime = 1370950288894;
		var fs = {
			stat: function(path, callback) {
				callback('ERROR!', {
					mtime: modifiedTime
				});
			}
		};

		var expectedLastModifiedDate = new Date(modifiedTime).toString();

		var ResourceHeaderGenerator = proxyquire('../../../Router/staticResourceHandler/resourceHeaderGenerator', {
			fs: fs
		});

		// Don't specify the cache headers.
		var generateContentHeaders = ResourceHeaderGenerator(contentTypes, false);

		var deferred = generateContentHeaders('test.test', 'test');

		deferred.onComplete(function(resultHeaders) {
			resultHeaders.should.not.have.property('Last-Modified');
			resultHeaders.should.not.have.property('Cache-control');
			resultHeaders.should.not.have.property('Expires');

			done();
		});
	});

	it('should set the cache headers when appropriate.', function(done) {
		var modifiedTime = 1370950288894;
		var modifiedTimePlusNinetyDays = 1378726288894;
		var fs = {
			stat: function(path, callback) {
				callback(null, {
					mtime: modifiedTime
				});
			}
		};

		var ResourceHeaderGenerator = proxyquire('../../../Router/staticResourceHandler/resourceHeaderGenerator', {
			fs: fs
		});

		var expectedLastModifiedDate = new Date(modifiedTimePlusNinetyDays).toString();

		Date = function() {
			if (!arguments.length) {
				return new originalDate(modifiedTime);
			}

			return new originalDate(arguments);
		};

		// Don't specify the cache headers.
		var generateContentHeaders = ResourceHeaderGenerator(contentTypes, true);

		var deferred = generateContentHeaders('test.test', 'test');

		deferred.onComplete(function(resultHeaders) {
			resultHeaders.should.have.property('Expires');
			resultHeaders['Expires'].should.equal(expectedLastModifiedDate);
			resultHeaders.should.have.property('Cache-control');

			done();
		});
	});

	afterEach(function() {
		Date = originalDate;
	})
});