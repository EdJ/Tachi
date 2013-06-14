describe('RouteFinder', function() {
	var routeFinder;
	beforeEach(function() {
		routeFinder = require('../../RouteFinder');
	});

	describe('#findBestMatchingRoute()', function() {
		it('should find no route if no routes are available.', function() {
			var match = routeFinder.findBestMatchingRoute([], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			match.should.equal('');
		});

		it('should find no route if no route matches.', function() {
			var match = routeFinder.findBestMatchingRoute([{
					url: '/{something}/',
					_parameters: ['something']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			match.should.equal('');
		});

		var TestCase = function(routes, matchWith, expectedResult) {
			return {
				routes: routes,
				matchWith: matchWith,
				expectedResult: expectedResult
			};
		};

		[
			TestCase([{
					url: '/{test}/',
					_parameters: ['test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			}, '/{test}/'),
			TestCase([{
					url: '/{controller}/{test}/',
					_parameters: ['test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			}, '/{controller}/{test}/'),
			TestCase([{
					url: '/test{controller}/case{test}/',
					_parameters: ['test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			}, '/test{controller}/case{test}/'),
			TestCase([{
					url: '/{controller}/{action}/{test}/',
					_parameters: ['test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			}, '/{controller}/{action}/{test}/')
		].forEach(function(testCase) {
			it('should find a route if a route partially, or fully, matches.', function() {
				var match = routeFinder.findBestMatchingRoute(testCase.routes, testCase.matchWith);

				match.should.equal(testCase.expectedResult);
			});
		});

		it('should fail to find a route if all routes have an additional parameter.', function() {
			var match = routeFinder.findBestMatchingRoute([{
					url: '/{something}/{test}/',
					_parameters: ['something', 'test']
				}, {
					url: '/{something}/{controller}/{action}/{test}/',
					_parameters: ['something', 'controller', 'action', 'test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			match.should.equal('');
		});

		it('should find a route if all routes except the match have an additional parameter.', function() {
			var match = routeFinder.findBestMatchingRoute([{
					url: '/{something}/{test}/',
					_parameters: ['something', 'test']
				}, {
					url: '/{something}/{controller}/{action}/{test}/',
					_parameters: ['something', 'controller', 'action', 'test']
				}, {
					url: '/{controller}/{action}/{test}/',
					_parameters: ['controller', 'action', 'test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			match.should.equal('/{controller}/{action}/{test}/');
		});
	});

	describe('#getUrl()', function() {
		it('should use the query string if the best matching route has no parameters.', function() {
			var parameters = {
				test: 'testValue',
				test2: 'testValue2'
			};

			var result = routeFinder.getUrl('/', parameters);

			result.should.equal('/?test=testValue&test2=testValue2');
		});

		it('should use the query string and the route if a partial match is found.', function() {
			var parameters = {
				test: 'testValue',
				test2: 'testValue2'
			};

			var result = routeFinder.getUrl('/{test}/', parameters);

			result.should.equal('/testValue/?test2=testValue2');
		});

		it('should not use the query string if a full match is found.', function() {
			var parameters = {
				test: 'testValue',
				test2: 'testValue2'
			};

			var result = routeFinder.getUrl('/{test}/{test2}/', parameters);

			result.should.equal('/testValue/testValue2/');
		});

		it('should retain constants in a matching route.', function() {
			var parameters = {
				test: 'testValue',
				test2: 'testValue2'
			};

			var result = routeFinder.getUrl('/{test}/hello/{test2}-!/', parameters);

			result.should.equal('/testValue/hello/testValue2-!/');
		});

		it('should retain additional parameters in a route with too many bindings.', function() {
			// This case should not be used, over-matched routes should not be passed to this method.
			var parameters = {
				test: 'testValue',
				test2: 'testValue2'
			};

			var result = routeFinder.getUrl('/{test}/{test2}/{test3}/', parameters);

			result.should.equal('/testValue/testValue2/{test3}/');
		});
	});

	describe('public interface', function() {
		it('should parse a route to the expected URL.', function() {
			var routeFinderFunction = routeFinder({
				routes: [{
						url: '/{something}/{test}/',
						_parameters: ['something', 'test']
					}, {
						url: '/{something}/{controller}/{action}/{test}/',
						_parameters: ['something', 'controller', 'action', 'test']
					}, {
						url: '/{controller}/{action}/{test}/',
						_parameters: ['controller', 'action', 'test']
					}
				]
			});

			var url = routeFinderFunction({
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			url.should.equal('/test/test/test1/');
		});
	});
});