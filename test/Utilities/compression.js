var proxyquire = require('proxyquire');
var Deferred = require('../../Async/deferred');

describe('compression', function() {
	describe('#checkHeaders()', function() {
		var compression;
		beforeEach(function() {
			compression = require('../../Utilities/compression');
		});

		it('should return null if the accept-encoding header is not specified.', function() {
			var request = {
				headers: {}
			};
			var compressionType = compression.checkHeaders(request);

			compressionType.should.be.empty;
		});

		// Need to work out a good TestCase syntax, this is too much duplication
		// but having the previously-used [].forEach syntax is very icky-looking.
		it('should return gzip if only gzip is defined.', function() {
			var request = {
				headers: {
					'accept-encoding': 'gzip'
				}
			};
			var compressionType = compression.checkHeaders(request);

			compressionType.should.equal('gzip');
		});

		it('should return deflate if only deflate is defined.', function() {
			var request = {
				headers: {
					'accept-encoding': 'deflate'
				}
			};
			var compressionType = compression.checkHeaders(request);

			compressionType.should.equal('deflate');
		});

		it('should return deflate if gzip and deflate are defined.', function() {
			var request = {
				headers: {
					'accept-encoding': 'deflate, gzip'
				}
			};
			var compressionType = compression.checkHeaders(request);

			compressionType.should.equal('deflate');
		});

		afterEach(function() {
			compression = null;
		});
	});

	describe('#isContentCompressable()', function() {
		var compression;
		beforeEach(function() {
			compression = require('../../Utilities/compression');
		});

		[
			['application/json', true],
			['text/html', true],
			['application/x-javascript', true],
			['text/css', true],
			['htm', true],
			['html', true],
			['js', true],
			['css', true],
			['application/pdf', false],
			['application/msword', false],
			['pdf', false],
			['apk', false]
		].forEach(function(testCase, i) {
			it('should return the expected result for a given content type or extension.', function() {
				var isContentCompressable = compression.isContentCompressable(testCase[0]);

				isContentCompressable.should.equal(testCase[1]);
			});
		});

		afterEach(function() {
			compression = null;
		});
	});

	describe('#adjustHeaders()', function() {
		var compression;
		var headers;
		beforeEach(function() {
			headers = {};
			compression = require('../../Utilities/compression');
		});

		var varyHeaderKey = 'Vary: Accept-Encoding';
		var encodingHeaderKey = 'Content-Encoding';

		it('should set the ' + varyHeaderKey + ' header regardless of input.', function() {
			compression.adjustHeaders(headers, '');

			headers.should.have.property(varyHeaderKey);
			headers[varyHeaderKey].should.equal('gzip, deflate');
		});

		it('should set deflate when deflate is specified as the encoding', function() {
			compression.adjustHeaders(headers, 'deflate');

			headers[encodingHeaderKey].should.equal('deflate');
		});

		it('should set gzip when gzip is specified as the encoding', function() {
			compression.adjustHeaders(headers, 'gzip');

			headers[encodingHeaderKey].should.equal('gzip');
		});

		afterEach(function() {
			headers = null;
			compression = null;
		});
	});

	describe('#compress()', function() {
		describe('valid content tests', function() {
			var compression;
			var proxyZlib;
			beforeEach(function() {
				var proxyCompressFunction = function(gzip, deflate) {
					return function(data, callback) {
						proxyZlib.gzipWasCalled = gzip;
						proxyZlib.deflateWasCalled = deflate;

						callback(null, data);
					};
				};

				proxyZlib = {
					deflate: proxyCompressFunction(false, true),
					gzip: proxyCompressFunction(true, false),
					gzipWasCalled: false,
					deflateWasCalled: false
				};

				var proxies = {
					'zlib': proxyZlib
				};

				compression = proxyquire('../../Utilities/compression', proxies);
			});

			it('should use deflate when deflate is specified', function(done) {
				var deferred = compression.compress('test', 'deflate');

				deferred.onComplete(function(result) {
					result.should.have.property('error');
					result.should.have.property('data');
					(!result.error).should.be.true;
					result.data.should.equal('test');

					proxyZlib.gzipWasCalled.should.be.false;
					proxyZlib.deflateWasCalled.should.be.true;

					done();
				});
			});

			it('should use gzip when gzip is specified', function(done) {
				var deferred = compression.compress('test', 'gzip');

				deferred.onComplete(function(result) {
					result.should.have.property('error');
					result.should.have.property('data');
					(!result.error).should.be.true;
					result.data.should.equal('test');

					proxyZlib.gzipWasCalled.should.be.true;
					proxyZlib.deflateWasCalled.should.be.false;

					done();
				});
			});

			afterEach(function() {
				proxyZlib = null;
				compression = null;
			});
		});
	});
});