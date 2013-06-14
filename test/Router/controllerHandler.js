var proxyquire = require('proxyquire');

describe('ControllerHandler', function() {
	var controllerHandlerPath = '../../Router/controllerHandler';
	var controllerHandler;
	beforeEach(function() {
		controllerHandler = require(controllerHandlerPath);
	});

	describe('#getAction()', function() {
		it('should return false if it cannot find a controller.', function() {
			var mockClassLoader = {
				getController: function() {
					return null;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'test'
			}, mockClassLoader);

			result.should.be.false;
		});

		it('should return false if the controller does not have the relevant action.', function() {
			var mockClassLoader = {
				getController: function() {
					return {
						index: function() {}
					};
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController',
				action: 'testAction'
			}, mockClassLoader);

			result.should.be.false;
		});

		it('should use index if no action is specified.', function() {
			var fakeController = {
				index: function() {}
			};

			var mockClassLoader = {
				getController: function() {
					return fakeController;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController'
			}, mockClassLoader);

			result.should.eql({
				controller: fakeController,
				action: 'index'
			});
		});

		it('should find the relevant action if one is specified.', function() {
			var fakeController = {
				index: function() {},
				testaction: function() {}
			};

			var mockClassLoader = {
				getController: function() {
					return fakeController;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController',
				action: 'testaction'
			}, mockClassLoader);

			result.should.eql({
				controller: fakeController,
				action: 'testaction'
			});
		});

		it('should expect actions in lower case.', function() {
			var fakeController = {
				index: function() {},
				testAction: function() {}
			};

			var mockClassLoader = {
				getController: function() {
					return fakeController;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController',
				action: 'testAction'
			}, mockClassLoader);

			result.should.eql(false);
		});

		it('should allow actions to be specified in any case.', function() {
			var fakeController = {
				index: function() {},
				testaction: function() {}
			};

			var mockClassLoader = {
				getController: function() {
					return fakeController;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController',
				action: 'TeStAcTiOn'
			}, mockClassLoader);

			result.should.eql({
				controller: fakeController,
				action: 'testaction'
			});
		});

		it('should not use the _post action if the request is not a post.', function() {
			var fakeController = {
				index: function() {},
				testaction: function() {},
				testaction_post: function() {}
			};

			var mockClassLoader = {
				getController: function() {
					return fakeController;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController',
				action: 'testAction'
			}, mockClassLoader);

			result.should.eql({
				controller: fakeController,
				action: 'testaction'
			});
		});

		it('should use the _post action if the request is a post.', function() {
			var fakeController = {
				index: function() {},
				testaction: function() {},
				testaction_post: function() {}
			};

			var mockClassLoader = {
				getController: function() {
					return fakeController;
				}
			};

			var result = controllerHandler.getAction({}, {}, {
				controller: 'testController',
				action: 'testAction',
				_method: 'POST'
			}, mockClassLoader);

			result.should.eql({
				controller: fakeController,
				action: 'testaction_post'
			});
		});
	});

	describe('public interface', function() {
		it('should return false if there is no matching route.', function(done) {
			var mockClassLoader = {
				getController: function() {
					return null;
				}
			};

			var getControllerData = controllerHandler({}, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {});

			deferred.onComplete(function(result) {
				result.should.be.false;

				done();
			});
		});

		it('should use the default route if none is passed in.', function(done) {
			var expectedResult = 'Some default data.';

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return null;
					}

					return {
						index: function() {
							return expectedResult;
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should use the default route if a match is not found.', function(done) {
			var expectedResult = 'Some default data.';

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return null;
					}

					return {
						index: function() {
							return expectedResult;
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should use the default route if a match is found but has no matching action.', function(done) {
			var expectedResult = 'Some default data.';

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return 'An unexpected result.';
							}
						}
					}

					return {
						index: function() {
							return expectedResult;
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test',
				action: 'amissingaction'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should use a specific controller if a match is found.', function(done) {
			var expectedResult = 'Some default data.';

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return expectedResult;
							}
						};
					}

					return {
						index: function() {
							return 'Some unexpected data.';
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should use a specific controller and action if a match is found.', function(done) {
			var expectedResult = 'Some default data.';

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return 'Not the expected result.';
							},
							something: function() {
								return expectedResult;
							}
						};
					}

					return {
						index: function() {
							return 'Some unexpected data.';
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test',
				action: 'something'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should allow the controller to finish asynchronously.', function(done) {
			var expectedResult = 'Some default data.';

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return 'Not the expected result.';
							},
							something: function() {
								this._promiseCallback(expectedResult);
							}
						};
					}

					return {
						index: function() {
							return 'Some unexpected data.';
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test',
				action: 'something'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});
		});

		it('should allow the controller to return a deferred.', function(done) {
			var expectedResult = 'Some default data.';

			var returnedDeferred = new Deferred();

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return 'Not the expected result.';
							},
							something: function() {
								return returnedDeferred;
							}
						};
					}

					return {
						index: function() {
							return 'Some unexpected data.';
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test',
				action: 'something'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});

			returnedDeferred.complete(expectedResult);
		});

		it('should process the request if the controller requires authentication but not on the requested action.', function(done) {
			var expectedResult = 'Some default data.';

			var returnedDeferred = new Deferred();

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return 'Not the expected result.';
							},
							something: function() {
								return returnedDeferred;
							},
							_authenticate: ['index']
						};
					}

					return {
						index: function() {
							return 'Some unexpected data.';
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test',
				action: 'something'
			});

			deferred.onComplete(function(result) {
				result.should.equal(expectedResult);

				done();
			});

			returnedDeferred.complete(expectedResult);
		});

		it('should redirect for an unauthenticated request on an action requiring authentication.', function(done) {
			var expectedResult = 'Some default data.';

			var returnedDeferred = new Deferred();

			var mockClassLoader = {
				getController: function(controllerName, request, response) {
					if (controllerName !== 'default') {
						return {
							index: function() {
								return 'Not the expected result.';
							},
							something: function() {
								return returnedDeferred;
							},
							_authenticate: ['something']
						};
					}

					return {
						index: function() {
							return 'Some unexpected data.';
						}
					};
				}
			};

			var mockDefaultRoute = {
				controller: 'default'
			};

			controllerHandler = proxyquire(controllerHandlerPath, {
				'../Auth/authHandler': {
					isAuthenticated: function() {
						return false;
					}
				}
			})

			var getControllerData = controllerHandler(mockDefaultRoute, '/Login', mockClassLoader);
			var deferred = getControllerData({}, {}, {
				controller: 'test',
				action: 'something'
			});

			deferred.onComplete(function(result) {
				result.should.eql({
					_redirect: '/Login'
				});

				done();
			});

			returnedDeferred.complete(expectedResult);
		});
	});
});