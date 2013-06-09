var assert = require('should');
var proxyquire = require('proxyquire');
Deferred = require('../../Async/Deferred');

var getCompressionHandler = function(compressionProxy) {
	return proxyquire('../../Utilities/compressionHandler', {
		'./compression': compressionProxy
	});
};

describe('CompressionHandler', function() {
	it('should return if the client doesn\'t accept compression.', function(done) {
		var compressionHandler = getCompressionHandler({
			checkHeaders: function() {
				return false;
			}
		});

		var result = compressionHandler({}, {
			writeHead: function() {},
			write: function() {}
		}, {
			toCompress: ''
		});

		result.should.be.an.instanceOf(Deferred);
		result.isComplete().should.be.true;

		result.onComplete(function(output) {
			output.should.have.property('compressedData');
			output.compressedData.should.be.false;

			done();
		});
	});

	it('should return if the content type is uncompressable.', function(done) {
		var headersWereChecked = false;
		var compressionHandler = getCompressionHandler({
			checkHeaders: function() {
				headersWereChecked = true;
				return true;
			},
			isContentCompressable: function() {
				return false;
			}
		});

		var result = compressionHandler({}, {
			writeHead: function() {},
			write: function() {}
		}, {
			toCompress: ''
		});

		result.should.be.an.instanceOf(Deferred);
		result.isComplete().should.be.true;

		result.onComplete(function(output) {
			output.should.have.property('compressedData');
			output.compressedData.should.be.false;

			headersWereChecked.should.be.true;

			done();
		});
	});

	it('should write the original data when there is an error compressing.', function(done) {
		var compressWasCalled = false;
		var dataThatWasWritten = null;
		var compressionHandler = getCompressionHandler({
			checkHeaders: function() {
				return true;
			},
			isContentCompressable: function() {
				return true;
			},
			compress: function() {
				compressWasCalled = true;
				var deferred = new Deferred();

				deferred.complete({
					error: true,
					compressedData: 'Some compressed data.'
				});

				return deferred;
			}
		});

		var result = compressionHandler({}, {
			writeHead: function() {},
			write: function(dataToWrite) {
				dataThatWasWritten = dataToWrite;
			}
		}, {
			toCompress: 'Some data to compress.'
		});

		result.should.be.an.instanceOf(Deferred);

		result.onComplete(function(output) {
			output.should.have.property('compressedData');
			output.compressedData.should.be.false;

			dataThatWasWritten.should.equal('Some data to compress.');

			compressWasCalled.should.be.true;

			done();
		});
	});

	it('should write the compressed data when there compression completes, and adjust the response headers.', function(done) {
		var compressWasCalled = false;
		var headersWereAdjusted = false;
		var dataThatWasWritten = null;
		var compressionHandler = getCompressionHandler({
			checkHeaders: function() {
				return true;
			},
			isContentCompressable: function() {
				return true;
			},
			compress: function() {
				compressWasCalled = true;
				var deferred = new Deferred();

				deferred.complete({
					error: false,
					compressedData: 'Some compressed data.'
				});

				return deferred;
			},
			adjustHeaders: function () {
				headersWereAdjusted = true;
			}
		});

		var result = compressionHandler({}, {
			writeHead: function() {},
			write: function(dataToWrite) {
				dataThatWasWritten = dataToWrite;
			}
		}, {
			toCompress: ''
		});

		result.should.be.an.instanceOf(Deferred);

		result.onComplete(function(output) {
			output.should.have.property('compressedData');
			output.compressedData.should.be.true;

			dataThatWasWritten.should.equal('Some compressed data.');

			compressWasCalled.should.be.true;
			headersWereAdjusted.should.be.true;

			done();
		});
	});
});