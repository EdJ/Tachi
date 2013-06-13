describe('ViewParser', function() {
	var viewParser;
	beforeEach(function() {
		viewParser = require('../../Views/viewParser');
	});

	describe('parse', function() {
		it('should return an empty string for an empty view.', function(done) {
			var result = viewParser.parse('testViewName', '');

			result.properties.should.eql([]);

			var deferred = result.view({});

			deferred.onComplete(function(resultHtml) {
				resultHtml.should.equal('');

				done();
			});
		});

		it('should return raw HTML from a view with no properties.', function(done) {
			var result = viewParser.parse('testViewName', '<html></html>');

			result.properties.should.eql([]);

			var deferred = result.view({});

			deferred.onComplete(function(resultHtml) {
				resultHtml.should.equal('<html></html>');

				done();
			});
		});

		it('should return just a variable for a view with only a bound variable.', function(done) {
			var result = viewParser.parse('testViewName', '<%= test %>');

			result.properties.should.eql([]);

			var deferred = result.view({
				test: 'Some data.'
			});

			deferred.onComplete(function(resultHtml) {
				resultHtml.should.equal('Some data.');
				
				done();
			});
		});

		it('should return a variable embedded in HTML for a complex view.', function(done) {
			var result = viewParser.parse('testViewName', '<div><%= test %></div>');

			result.properties.should.eql([]);

			var deferred = result.view({
				test: 'Some data.'
			});

			deferred.onComplete(function(resultHtml) {
				resultHtml.should.equal('<div>Some data.</div>');
				
				done();
			});
		});

		it('should allow arbitrary code in a view.', function(done) {
			var result = viewParser.parse('testViewName', '<div><% if (showTest) { %><%= test %><% } %></div>');

			result.properties.should.eql([]);

			var deferred = result.view({
				test: 'Some data.',
				showTest: false
			});

			deferred.onComplete(function(resultHtml) {
				resultHtml.should.equal('<div></div>');

				done();
			});
		});

		it('should wait for the result of a deferred parameter.', function(done) {
			var result = viewParser.parse('testViewName', '<div><% if (showTest) { %><%= test %><% } %></div>');

			result.properties.should.eql([]);

			var testDeferred = new Deferred();

			var deferred = result.view({
				test: testDeferred,
				showTest: true
			});

			deferred.onComplete(function(resultHtml) {
				resultHtml.should.equal('<div>Some data.</div>');

				done();
			});

			testDeferred.complete('Some data.');
		});
	});
});