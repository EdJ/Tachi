var assert = require('should');
var proxyquire = require('proxyquire');

describe('ComplexObjectParser', function () {
	describe('#parse()', function () {
		it('should return an empty object when an empty object is passed in.',
			function () {
				var ComplexObjectParser = proxyquire('../../FormParsing/complexObjectParser', {
					'./formValueParser': function FakeValueParser() {}
				});

				var complexObjectParser = new ComplexObjectParser();

				var result = complexObjectParser.parse({});
				result.should.eql({});
			}
		);
	});
});