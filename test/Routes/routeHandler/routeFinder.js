describe('RouteFinder', function() {
	var routeFinder;
	beforeEach(function() {
		routeFinder = require('../../../Routes/routeHandler/routeFinder');
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
					_parameters: ['something','test']
				},
				{
					url: '/{something}/{controller}/{action}/{test}/',
					_parameters: ['something','controller','action','test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			match.should.equal('');
		});

		it('should a route if all routes except the match have an additional parameter.', function() {
			var match = routeFinder.findBestMatchingRoute([{
					url: '/{something}/{test}/',
					_parameters: ['something','test']
				},
				{
					url: '/{something}/{controller}/{action}/{test}/',
					_parameters: ['something','controller','action','test']
				},
				{
					url: '/{controller}/{action}/{test}/',
					_parameters: ['controller','action','test']
				}
			], {
				controller: 'test',
				action: 'test',
				test: 'test1'
			});

			match.should.equal('/{controller}/{action}/{test}/');
		});
	});
});