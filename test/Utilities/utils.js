var proxyquire = require('proxyquire');

describe('utils', function() {
	var utils;
	beforeEach(function() {
		utils = require('../../Utilities/utils');
	});

	describe('#extend()', function() {
		it('should return an empty object when extending an empty object with null.', function() {
			var result = utils.extend({}, null);

			result.should.eql({});
		});

		it('should return an empty object when extending an empty object with an empty object.', function() {
			var result = utils.extend({}, {});

			result.should.eql({});
		});

		it('should return an empty object when extending null with an empty object.', function() {
			var result = utils.extend(null, {});

			result.should.eql({});
		});

		var TestCase = function TestCase(initialObject, toExtendWith, expectedResult) {
			this.initialObject = initialObject;
			this.toExtendWith = toExtendWith;
			this.expectedResult = expectedResult;
		};

		[
			new TestCase(true, {
				test: "one"
			}, {
				test: "one"
			}),
			new TestCase(false, {
				test: "one"
			}, {
				test: "one"
			}),
			new TestCase([], {
				test: "one"
			}, {
				test: "one"
			}),
			new TestCase(new Date(), {
				test: "one"
			}, {
				test: "one"
			})
		].forEach(function(testCase) {
			it('should overwrite a non-object first parameter.', function() {
				var result = utils.extend(testCase.initialObject, testCase.toExtendWith);

				result.should.eql(testCase.expectedResult);
			});
		});

		[
			new TestCase({}, {
				test: "one"
			}, {
				test: "one"
			}),
			new TestCase({
				test: "one"
			}, {
				test: "two"
			}, {
				test: "two"
			}),
			new TestCase({
				test: [1, 2]
			}, {
				test: [2, 3]
			}, {
				test: [2, 3]
			}),
			new TestCase({
				test: [1, 2]
			}, {
				test2: [2, 3]
			}, {
				test: [1, 2],
				test2: [2, 3]
			}),
		].forEach(function(testCase) {
			it('should return the expected result when extending an object.', function() {
				var result = utils.extend(testCase.initialObject, testCase.toExtendWith);

				result.should.eql(testCase.expectedResult);
			});
		});

		it('should not extend an object to be recursive.', function() {
			var initialObject = {
				test: "one"
			};

			var toExtendWith = {
				test2: "two",
				recursive: initialObject
			};

			var result = utils.extend(initialObject, toExtendWith);

			var expectedResult = {
				test: "one",
				test2: "two"
			};

			result.should.eql(expectedResult);
		});

		it('should not extend an object with a recursive property.', function() {
			var initialObject = {
				test: "one"
			};

			var toExtendWith = {
				test2: "two"
			};
			toExtendWith.recurisve = toExtendWith;

			var result = utils.extend(initialObject, toExtendWith);

			var expectedResult = {
				test: "one",
				test2: "two"
			};

			result.should.eql(expectedResult);
		});

		it('should not extend an object with an undefined property.', function() {
			var initialObject = {
				test: "one"
			};

			var toExtendWith = {
				test2: "two",
				test3: undefined
			};
			toExtendWith.recurisve = toExtendWith;

			var result = utils.extend(initialObject, toExtendWith);

			var expectedResult = {
				test: "one",
				test2: "two"
			};

			result.should.eql(expectedResult);
		});
	});
});