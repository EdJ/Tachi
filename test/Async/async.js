describe('Async', function() {
	var Async;
	beforeEach(function() {
		Async = require('../../Async/async');
	});

	var testFunction = function(callback) {
		setTimeout(function() {
			callback('test');
		}, 1);
	};

	it('should do nothing if nothing is passed in', function() {
		Async();
	});

	it('should execute a single function provided as an array.', function(done) {
		Async([testFunction], function(data) {
			data.should.eql(['test']);

			done();
		});
	});

	it('should execute a single function.', function(done) {
		Async(testFunction, function(data) {
			data.should.eql(['test']);

			done();
		});
	});

	it('should execute a single function.', function(done) {
		Async(testFunction, function(data) {
			data.should.eql(['test']);

			done();
		});
	});

	it('should execute multiple functions.', function(done) {
		Async(testFunction, testFunction, testFunction, function(data) {
			data.should.eql(['test', 'test', 'test']);

			done();
		});
	});

	var orderedTestFunction = function(timer, data) {
		return function(callback) {
			setTimeout(function() {
				callback(data);
			}, timer);
		};
	};

	it('should execute multiple functions in order.', function(done) {
		Async(orderedTestFunction(45, '1'),
			orderedTestFunction(30, '2'),
			orderedTestFunction(15, '3'),
			function(data) {
			data.should.eql(['1', '2', '3']);

			done();
		});
	});
})