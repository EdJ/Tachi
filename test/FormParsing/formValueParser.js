var assert = require('should');
var FormValueParser = require('../../FormParsing/formValueParser');

describe('FormValueParser', function () {
	describe('#parseDate()', function () {
		[
			null,
			{},
			'test',
			3589235892,
			1,
			{ headers: {} },
			'aserasdf2',
			'1111231 241241214124124124',
			'1111231-14124124124'
		].forEach(function (testCase, i) {
			it('should return "Invalid Date" when an invalid date is passed in. (' + JSON.stringify(testCase) + ')',
				function () {
					var formSegmentParser = new FormValueParser();

					formSegmentParser.parseDate(testCase).should.eql('Invalid Date');
				}
			);
		});

		[
			{ 
				input: '2012-01-12',
		 		expectedResult: new Date(2012, 0, 12)
			},
			{ 
				input: '3000-9-001',
		 		expectedResult: new Date(3000, 8, 1)
			},
			{ 
				input: '1-1-1',
		 		expectedResult: new Date(1, 0, 1)
			},
			{ 
				input: '2012/01/12',
		 		expectedResult: new Date(2012, 0, 12)
			},
			{ 
				input: '3000/9/001',
		 		expectedResult: new Date(3000, 8, 1)
			},
			{ 
				input: '1/1/1',
		 		expectedResult: new Date(1, 0, 1)
			},
			{ 
				input: '2012 01 12',
		 		expectedResult: new Date(2012, 0, 12)
			},
			{ 
				input: '3000 9 001',
		 		expectedResult: new Date(3000, 8, 1)
			},
			{ 
				input: '1 1 1',
		 		expectedResult: new Date(1, 0, 1)
			},
		].forEach(function (testCase, i) {
			it('should return "Invalid Date" when an invalid date is passed in. (' + JSON.stringify(testCase) + ')',
				function () {
					var formSegmentParser = new FormValueParser();

					formSegmentParser.parseDate(testCase.input).should.eql(testCase.expectedResult);
				}
			);
		});
	});
});