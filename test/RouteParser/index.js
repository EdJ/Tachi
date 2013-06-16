var proxyquire = require('proxyquire');

describe('RouteParser', function() {
	describe('#parseRoutes()', function() {
		it('should return an empty list if no list is passed in.', function() {
			var RouteParser = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/test') {
						return 'Default data.';
					}

					return null;
				}
			});

			var result = RouteParser.parseRoutes([]);

			result.should.eql([]);
		});

		it('should parse each route.', function() {
			var counter = 0;
			RouteParser = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/default') {
						return 'Default data.';
					}

					return ++counter;
				}
			});

			var result = RouteParser.parseRoutes(['/a', '/few', '/test', '/routes']);

			result.should.eql([1, 2, 3, 4]);
		});
	});

	describe('public interface', function() {
		it('should return an uninitialised set of data if none specified.', function() {
			var parseRouteData = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/') {
						return 'Default route.';
					}

					return null;
				}
			});

			var result = parseRouteData({
			});

			result.should.eql({
				routes: [],
				loginUrl: '/Login',
				defaultRoute: 'Default route.',
				statics: []
			});
		});
		it('should use the default URL of / if none is specified.', function() {
			var parseRouteData = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/') {
						return 'Default route.';
					}

					return null;
				}
			});

			var result = parseRouteData({
				routes: [],
				loginUrl: '/TestLoginUrl',
				statics: []
			});

			result.should.eql({
				routes: [],
				loginUrl: '/TestLoginUrl',
				defaultRoute: 'Default route.',
				statics: []
			});
		});

		it('should use specified default URL if one is specified.', function() {
			var parseRouteData = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/defaultRoute') {
						return 'Default route.';
					}

					return null;
				}
			});

			var result = parseRouteData({
				routes: [],
				loginUrl: '/TestLoginUrl',
				statics: [],
				defaultUrl: '/defaultRoute'
			});

			result.should.eql({
				routes: [],
				loginUrl: '/TestLoginUrl',
				defaultRoute: 'Default route.',
				statics: []
			});
		});

		it('should use the default login URL of /Login if none is specified.', function() {
			var parseRouteData = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/defaultRoute') {
						return 'Default route.';
					}

					return null;
				}
			});

			var result = parseRouteData({
				routes: [],
				statics: [],
				defaultUrl: '/defaultRoute'
			});

			result.should.eql({
				routes: [],
				loginUrl: '/Login',
				defaultRoute: 'Default route.',
				statics: []
			});
		});

		it('should parse every route.', function() {
			var counter = 0;
			var parseRouteData = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/defaultRoute') {
						return 'Default route.';
					}

					return ++counter;
				}
			});

			var result = parseRouteData({
				routes: ['/test', '/one', '/two'],
				statics: [],
				loginUrl: '/TestLoginUrl',
				defaultUrl: '/defaultRoute'
			});

			result.should.eql({
				routes: [1, 2, 3],
				loginUrl: '/TestLoginUrl',
				defaultRoute: 'Default route.',
				statics: []
			});
		});

		it('should not edit the static URLs.', function() {
			var counter = 0;
			var parseRouteData = proxyquire('../../RouteParser', {
				'./patternParser': function(route) {
					if (route === '/defaultRoute') {
						return 'Default route.';
					}

					return ++counter;
				}
			});

			var expectedStatics = ['/Content', '/OtherContent'];

			var result = parseRouteData({
				routes: ['/test', '/one', '/two'],
				statics: expectedStatics,
				loginUrl: '/TestLoginUrl',
				defaultUrl: '/defaultRoute'
			});

			result.should.eql({
				routes: [1, 2, 3],
				loginUrl: '/TestLoginUrl',
				defaultRoute: 'Default route.',
				statics: expectedStatics
			});

			result.statics.should.equal(expectedStatics);
		});
	});
});