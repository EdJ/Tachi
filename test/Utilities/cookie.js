var assert = require('should');

var CookieParser = require('../../Utilities/cookie');

describe('cookieParser', function () {
	describe('#get()', function () {
		// This syntax sucks, mocha really needs built in testCase support!
		[null, {}, 'test', 1, { headers: {} }, { headers: { cookie: 1 }}].forEach(function (testCase, i) {
			it('should return an empty object when an invalid request is passed in. (' + JSON.stringify(testCase) + ')',
				function () {
					var cookieParser = new CookieParser();

					cookieParser.get(testCase).should.eql({});
				}
			);
		});

		[
			{
				data: '',
				expected: {}
			},
			{
				data: 'test=1',
				expected: { test : '1' }
			},
			{
				data: 'test=1;test2=2',
				expected: { test : '1', test2: '2' }
			},
			{
				data: 'test=1;test2=2;test=4',
				expected: { test : '4', test2: '2' }
			},
			{
				data: 'test=1;tes=t2=2;test=4',
				expected: { test : '4', tes: 't2'}
			},
			{
				data: 'test=1;tes=t2=2;test=4;=',
				expected: { test : '4', tes: 't2', '': '' }
			},
			{
				data: 'test=1;tes=t2=2;test=4;=;',
				expected: { test : '4', tes: 't2', '': '' }
			},
		].forEach(function (testCase, i) {
			it('should populate an object with cookies when it matches. (' + JSON.stringify(testCase) + ')',
				function () {
					var cookieParser = new CookieParser();
					var fakeRequest = { headers: { cookie: testCase.data }};

					cookieParser.get(fakeRequest).should.eql(testCase.expected);
				}
			);
		});
	});
	describe('#set()', function () {
		[null, {}, 'test', 1, { headers: {} }, { headers: { cookie: 1 }}].forEach(function (testCase, i) {
			it('should do nothing when an invalid response is passed in. (' + JSON.stringify(testCase) + ')',
				function () {
					var cookieParser = new CookieParser();

					cookieParser.set(testCase, { testCookie: 'test'});
				}
			);
		});
	});
});