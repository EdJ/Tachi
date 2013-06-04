var assert = require('should');

var CookieParser = require('../../Utilities/cookie');

describe('CookieParser', function () {
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
		[null, {}, 'test', 1, { headers: {} }, { headers: { cookie: 1 }}, { setHeader: 'test'}].forEach(function (testCase, i) {
			it('should do nothing when an invalid response is passed in. (' + JSON.stringify(testCase) + ')',
				function () {
					var cookieParser = new CookieParser();

					cookieParser.set(testCase, { testCookie: 'test'});
				}
			);
		});

		it('should not set the Set-Cookie header for prototypal properties',
			function () {
				var cookieParser = new CookieParser();
				var endData = [];

				var response = {
					setHeader: function (header, value) {
						endData.push({
							header: header,
							value: value
						});
					}
				}

				function FakeCookie() {
				};
				FakeCookie.prototype.testCookie = 'test';
				var cookie = new FakeCookie();

				cookieParser.set(response, cookie);

				endData.should.have.length(0);
			}
		);

		it('should set the Set-Cookie header if the response is valid',
			function () {
				var cookieParser = new CookieParser();
				var endData = [];

				var response = {
					setHeader: function (header, value) {
						endData.push({
							header: header,
							value: value
						});
					}
				}

				cookieParser.set(response, { testCookie: 'test'});

				endData.should.have.length(1);
				var result = endData[0];

				result.header.should.eql('Set-Cookie');
				result.value.should.eql('testCookie=test');
			}
		);

		it('should set multiple cookie headers if the response is valid',
			function () {
				var cookieParser = new CookieParser();
				var endData = [];

				var response = {
					setHeader: function (header, value) {
						endData.push({
							header: header,
							value: value
						});
					}
				}

				cookieParser.set(response, { testCookie: 'test', otherTest: 2 });

				endData.should.have.length(2);
				var result = endData[0];

				result.header.should.eql('Set-Cookie');
				result.value.should.eql('testCookie=test');
				var secondaryResult = endData[1];

				secondaryResult.header.should.eql('Set-Cookie');
				secondaryResult.value.should.eql('otherTest=2');
			}
		);
	});
});