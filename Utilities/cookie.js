Cookie = module.exports = (function () {

    var getCookies = function (req) {
        var cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            cookies[parts[0].trim()] = (parts[1] || '').trim();
        });

        return cookies;
    };

    var setCookie = function (res, cookie) {
        for (var key in cookie) {
            res.setHeader('Set-Cookie', key + '=' + cookie[key]);
        }
    };

    return {
        get: getCookies,
        set: setCookie
    };

})();