var proxyquire = require('proxyquire');

describe('Router', function() {
	describe('#redirect()', function() {
		var Router;
		beforeEach(function() {
			Router = require('../../Router');
		});

		it('should set the redirect headers but not end the response.', function() {
			var responseHeaders;
			var responseCode;
			var responseWasEnded = false;
			var response = {
				writeHead: function(code, headers) {
					responseCode = code;
					responseHeaders = headers;
				},
				end: function() {
					responseWasEnded = true;
				}
			};

			Router.redirect(response, '/test');

			responseHeaders.should.have.property('Location');
			responseHeaders.Location.should.equal('/test');

			responseCode.should.equal(302);
			responseWasEnded.should.be.false;
		});
	});

	describe('public interface', function() {
		it('should pass static requests to the staticContentHandler.', function(done) {
			var mockCreateRequestDataParser = function() {
				return function() {
					return new Deferred().complete({
						_isStatic: true
					});
				};
			};

			var expectedResult = 'Did static call.';

			var mockStaticResourceHandler = function() {
				return new Deferred().complete(expectedResult);
			};

			var mockCreateControllerHandler = function() {
				return null;
			};

			var Router = proxyquire('../../Router', {
				'./requestDataParser': mockCreateRequestDataParser,
				'./controllerHandler': mockCreateControllerHandler,
				'./staticResourceHandler': mockStaticResourceHandler
			});

			var routeRequest = new Router({}, {});

			var deferred = routeRequest({}, {});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should return any data returned from a controller.', function(done) {
			var mockCreateRequestDataParser = function() {
				return function() {
					return new Deferred().complete({
						_isStatic: false
					});
				};
			};

			var mockStaticResourceHandler = function() {
				return new Deferred().complete('Did static call.');
			};

			var expectedResult = 'Some controller data.';

			var mockCreateControllerHandler = function() {
				return function() {
					return new Deferred().complete(expectedResult);
				};
			};

			var Router = proxyquire('../../Router', {
				'./requestDataParser': mockCreateRequestDataParser,
				'./controllerHandler': mockCreateControllerHandler,
				'./staticResourceHandler': mockStaticResourceHandler
			});

			var routeRequest = new Router({}, {});

			var deferred = routeRequest({}, {});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should return any data returned from a controller when the data is the result of a Deferred.', function(done) {
			var mockCreateRequestDataParser = function() {
				return function() {
					return new Deferred().complete({
						_isStatic: false
					});
				};
			};

			var mockStaticResourceHandler = function() {
				return new Deferred().complete('Did static call.');
			};

			var mockCreateControllerHandler = function() {
				return function() {
					var dataDeferred = new Deferred().complete('Some deferred controller data.');
					return new Deferred().complete(dataDeferred);
				};
			};

			var Router = proxyquire('../../Router', {
				'./requestDataParser': mockCreateRequestDataParser,
				'./controllerHandler': mockCreateControllerHandler,
				'./staticResourceHandler': mockStaticResourceHandler
			});

			var routeRequest = new Router({}, {});

			var deferred = routeRequest({}, {});

			deferred.onComplete(function(result) {
				result.should.equal('Some deferred controller data.');

				done();
			});
		});

		it('should perform a redirect when the output data contains the _redirect property.', function(done) {
			var mockCreateRequestDataParser = function() {
				return function() {
					return new Deferred().complete({
						_isStatic: false
					});
				};
			};

			var mockStaticResourceHandler = function() {
				return new Deferred().complete('Did static call.');
			};

			var expectedResult = {
				_redirect: '/test'
			};

			var mockCreateControllerHandler = function() {
				return function() {
					return new Deferred().complete(expectedResult);
				};
			};

			var Router = proxyquire('../../Router', {
				'./requestDataParser': mockCreateRequestDataParser,
				'./controllerHandler': mockCreateControllerHandler,
				'./staticResourceHandler': mockStaticResourceHandler
			});

			var routeRequest = new Router({}, {});

			var didRedirect = false;

			var deferred = routeRequest({}, {
				writeHead: function() {
					didRedirect = true;
				}
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});
	});
});