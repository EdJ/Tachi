describe('routeHandler', function() {
	var routeParser;
	beforeEach(function() {
		routeParser = require('../../../Routes/routeHandler/routeParser');
	});

	describe('#getParameters()', function() {
		it('should return no parameters from a blank route.', function() {
			var parameters = routeParser.getParameters('/');

			parameters.should.eql([]);
		});

		it('should return no parameters from no route.', function() {
			var parameters = routeParser.getParameters('');

			parameters.should.eql([]);
		});

		it('should return no parameters from a non-parameterised route.', function() {
			var parameters = routeParser.getParameters('/test');

			parameters.should.eql([]);
		});

		it('should split a single parameter from a simple route.', function() {
			var parameters = routeParser.getParameters('/{test}');

			parameters.should.eql(['test']);
		});

		it('should split a single parameter from a simple route that ends with a /.', function() {
			var parameters = routeParser.getParameters('/{test}/');

			parameters.should.eql(['test']);
		});

		it('should split a single parameter from a simple route with a constant.', function() {
			var parameters = routeParser.getParameters('/{test}-something');

			parameters.should.eql(['test']);
		});

		it('should split multiple parameters from a complex route.', function() {
			var parameters = routeParser.getParameters('/{test}/{test2}/');

			parameters.should.eql(['test', 'test2']);
		});

		it('should split multiple parameters from a complex route with a constant.', function() {
			var parameters = routeParser.getParameters('/{test}-test/test2-{test2}/test3');

			parameters.should.eql(['test', 'test2']);
		});

		it('should not grab parameters from a route without closed brackets.', function() {
			var parameters = routeParser.getParameters('/{test');

			parameters.should.eql([]);
		});

		it('should be greedy when parsing mis-matched brackets.', function() {
			var parameters = routeParser.getParameters('/{test/{test2}/');

			parameters.should.eql(['test/{test2']);
		});

		it('should allow multiple parameters to be named the same.', function() {
			// This case is useless, but not prevented.
			var parameters = routeParser.getParameters('/{test}/{test}/');

			parameters.should.eql(['test', 'test']);
		});
	});

	describe('#generateParseFunction()', function() {
		var TestCase = function(pattern, url, expectedResult) {
			return {
				pattern: pattern,
				url: url,
				expectedResult: expectedResult
			};
		};

		[
			// The gerated function doesn't currently allow for matches where a trailing / is missing.
			TestCase('/{test}/', '/test'),
			TestCase('/hello{test}/', '/blah/'),
			TestCase('/hello{test}/{test2}/', '/blah/test2/'),
			TestCase('/{test}/{test2}/', '/no-pe/'),
		].forEach(function(testCase) {
			it('should return false when a route doesn\'t match the URL. (' + testCase.pattern + ', ' + testCase.url + ')', function() {
				var parseFunction = routeParser.generateParseFunction(testCase.pattern);
				var parameters = parseFunction(testCase.url);

				parameters.should.eql(false);
			});
		});

		[
			TestCase('/', '/', {}),
			TestCase('/', '/test', {}),
			TestCase('/{test}/', '/test/', {
				test: 'test'
			}),
			// It's not recommended to use greedy patterns, but you can.
			TestCase('/{test}/{test2}', '/testOne/testTwo', {
				test: 'testOne',
				test2: 'testTwo'
			}),
			TestCase('/{test}/{test2}/', '/testOne/testTwo/', {
				test: 'testOne',
				test2: 'testTwo'
			})
		].forEach(function(testCase) {
			it('should return a function that resolves the expected parameters. (' + testCase.pattern + ', ' + testCase.url + ')', function() {
				var parseFunction = routeParser.generateParseFunction(testCase.pattern);
				var parameters = parseFunction(testCase.url);

				parameters.should.eql(testCase.expectedResult);
			});
		});
	});

	describe('public interface', function() {
		it('should parse a route that is provided as a string.', function() {
			var result = routeParser('/{test}/');

			result.should.have.property('func');
			result.data.should.eql({});
			result._parameters.should.eql(['test']);
		});

		it('should parse a route that is provided as an object.', function() {
			var result = routeParser({
				url: '/{test}/'
			});

			result.should.have.property('func');
			result.data.should.eql({});
			result._parameters.should.eql(['test']);
		});

		it('should return any passed data as pre-set data.', function() {
			var result = routeParser({
				url: '/{test}/',
				data: {
					testData: 'test'
				}
			});

			result.should.have.property('func');
			result.data.should.eql({
				testData: 'test'
			});
			
			result._parameters.should.eql(['test']);
		});
	});
});