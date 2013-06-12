// This is heplful for some of the tests.
Utils = require('../../Utilities/utils');

describe('UrlParser', function() {
	var urlParser;
	beforeEach(function() {
		urlParser = require('../../Routes/urlParser');
	});

	describe('isStaticUrl', function() {
		it('should return false if the URL is dynamic.', function() {
			var result = urlParser.isStaticUrl(['/test'], '/test.html?test=1');

			result.should.be.false;
		});

		it('should return false if the URL is not a file.', function() {
			var result = urlParser.isStaticUrl(['/test'], '/test/test2');

			result.should.be.false;
		});

		it('should return true if the URL matches a static path.', function() {
			var result = urlParser.isStaticUrl(['/test'], '/test/test2.js');

			result.should.be.true;
		});

		it('should return true if the URL matches one of many static paths.', function() {
			var result = urlParser.isStaticUrl(['/test', '/tes', '/t', '/hello', '/content'], '/test/test2.js');

			result.should.be.true;
		});

		it('should return false if the URL matches a static path not at the root level.', function() {
			var result = urlParser.isStaticUrl(['/test'], '/hello/test/test2.js');

			result.should.be.false;
		});
	});

	describe('#parseParameters()', function() {
		it('should return an empty object for a blank URL.', function() {
			var result = urlParser.parseParameters([], '');

			result.should.eql({});
		});

		it('should return an empty object when no route matches.', function() {
			var result = urlParser.parseParameters([], '/test');

			result.should.eql({});
		});

		it('should gain parameters based on the matched route\'s additional parameters.', function() {
			var routeFunction = function() {
				return {};
			};

			var routeData = {
				someData: 'yes'
			};

			var result = urlParser.parseParameters([{
					func: routeFunction,
					data: routeData
				}
			], '/');

			result.should.eql({
				someData: 'yes',
				_isStatic: false
			});
		});

		it('should gain parameters from the query string.', function() {
			var routeFunction = function() {
				return {};
			};

			var routeData = {};

			var result = urlParser.parseParameters([{
					func: routeFunction,
					data: routeData
				}
			], '/?testData=test');

			result.should.eql({
				testData: 'test',
				_isStatic: false
			});
		});

		it('should override default parameters with query string parameters.', function() {
			var routeFunction = function() {
				return {};
			};

			var routeData = {
				testData: 'original data.'
			};

			var result = urlParser.parseParameters([{
					func: routeFunction,
					data: routeData
				}
			], '/?testData=test');

			result.should.eql({
				testData: 'test',
				_isStatic: false
			});
		});

		it('should only gain parameters from a matching route.', function() {
			var routeFunction = function() {
				return {};
			};

			var failedRouteFunction = function() {
				return false;
			};

			var routeData = {
				testData: 'original data.'
			};

			var failedRouteData = {
				otherTestData: 'original failed route data.'
			};

			var result = urlParser.parseParameters([{
					func: failedRouteFunction,
					data: failedRouteData
				}, {
					func: routeFunction,
					data: routeData
				}, {
					func: failedRouteFunction,
					data: failedRouteData
				}
			], '/test');

			result.should.eql({
				testData: 'original data.',
				_isStatic: false
			});
		});
	});

	describe('public interface', function() {
		it('should return an object with only the _isStatic property if the URL matches a static path.', function() {
			var path = urlParser([], ['/test'], '/test/test.html');

			path.should.eql({
				_isStatic: true
			});
		});

		it('should ignore matching routes if a static path is available.', function() {
			var path = urlParser([{
					func: function() {
						return {};
					},
					data: {
						test: 'data'
					}
				}
			], ['/test'], '/test/test.html');

			path.should.eql({
				_isStatic: true
			});
		});

		it('should use a route if no static path matches.', function() {
			var path = urlParser([{
					func: function() {
						return {};
					},
					data: {
						test: 'data'
					}
				}
			], ['/Content'], '/test/test.html');

			path.should.eql({
				test: 'data',
				_isStatic: false
			});
		});
	});
});