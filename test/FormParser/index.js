var assert = require('should');
var proxyquire = require('proxyquire');

describe('FormDataParser', function() {
	var parseComplexObject;
	beforeEach(function() {
		parseComplexObject = proxyquire('../../FormParser', {
			'./formValueParser': function FakeValueParser() {
				this.parseDate = function(value) {
					return 'Invalid Date';
				}
			}
		});
	});

	it('should return an empty object when an empty object is passed in.', function() {
		var result = parseComplexObject({});
		result.should.eql({});
	});

	it('should return an object with matching properties when only single-level names are present.', function() {
		var result = parseComplexObject({
			"test": "test",
			"one": 1
		});

		result.should.eql({
			test: "test",
			one: 1
		});
	});

	it('should convert to a number when appropriate.', function() {
		var result = parseComplexObject({
			"test": "1234455.111",
			"one": "1",
			// Spaces should prevent conversion to a number
			"two": "123 456 789",
			// Minus sign should not parse as an equation
			"three": "123-456"
		});

		result.should.eql({
			test: 1234455.111,
			one: 1,
			two: "123 456 789",
			three: "123-456"
		});
	});

	it('should parse to an array when multiple indexes are specified.', function() {
		var result = parseComplexObject({
			"test[0]": "test",
			"test[1]": 1
		});

		result.should.eql({
			test: ["test", 1]
		});
	});

	it('should still parse to an array if the zero index is not specified.', function() {
		var result = parseComplexObject({
			"test[1]": 1
		});

		var returnedArray = [];
		returnedArray[1] = 1;

		result.should.eql({
			test: returnedArray
		});
	});

	it('should parse to a sub-object when a name contains a ".".', function() {
		var result = parseComplexObject({
			"test.one": "test"
		});

		result.should.eql({
			test: {
				one: "test"
			}
		});
	});

	it('should correctly parse long name chains.', function() {
		var result = parseComplexObject({
			"test.one[0].first.property[0].name": "test"
		});

		result.should.eql({
			test: {
				one: [{
						first: {
							property: [{
									name: "test"
								}
							]
						}
					}
				]
			}
		});
	});

	it('should use the date value if appropriate.', function() {
		parseComplexObject = proxyquire('../../FormParser', {
			'./formValueParser': function FakeValueParser() {
				this.parseDate = function(value) {
					return 'A date value.';
				}
			}
		});

		var result = parseComplexObject({
			"test": "test",
			"one": 1
		});

		result.should.eql({
			test: "A date value.",
			one: "A date value."
		});
	});
});