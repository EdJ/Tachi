module.exports = new (function CookieParser() {
    this.get = function (req) {
        if (!req
         || !req.headers
         || !req.headers.cookie
         || typeof req.headers.cookie !== 'string') {
            // Not a valid request.
            return {};
        }

        var cookies = {};
        req.headers.cookie.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            cookies[parts[0].trim()] = (parts[1] || '').trim();
        });

        return cookies;
    };

    this.set = function (res, cookie) {
        if (!res
         || !res.setHeader
         || typeof res.setHeader !== 'function') {
            // Not a valid response.
            return;
        }

        for (var key in cookie) {
            if (!cookie.hasOwnProperty(key)){
                continue;
            }

            res.setHeader('Set-Cookie', key + '=' + cookie[key]);
        }
    };
})();