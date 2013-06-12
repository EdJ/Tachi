var qs = require('querystring');

module.exports = (function() {
    var isStaticUrl = function(statics, pathWithQueryString) {
        if (!~pathWithQueryString.indexOf('.') || !! ~pathWithQueryString.indexOf('?')) {
            return false;
        }

        for (var i = statics.length; i--;) {
            var st = pathWithQueryString.indexOf(statics[i]);
            if (!st) {
                return true;
            }
        }

        return false;
    };

    var parseParameters = function(patterns, pathWithQs) {
        var split = pathWithQs.split('?');
        if (!split.length) {
            return {};
        }


        var path = split[0];
        if (path.substr(-1) != '/') {
            path += '/';
        }

        var queryStringData = qs.parse(split[1] || '');
        var pattern;
        var output;

        for (var i = patterns.length; i--;) {
            pattern = patterns[i];

            output = pattern.func(path);
            if (!output) {
                continue;
            }

            Utils.extend(output, pattern.data);
            Utils.extend(output, queryStringData);

            output._isStatic = false;
            return output;
        }

        return {};
    };

    var UrlParser = function(routes, statics, pathWithQueryString) {
        return function(pathWithQueryString) {
            var isStatic = isStaticUrl(statics, pathWithQueryString);
            if (isStatic) {
                return {
                    _isStatic: true
                };
            }

            return parseParameters(routes, pathWithQueryString);
        };
    };

    // Expose some functions for unit testing.
    UrlParser.isStaticUrl = isStaticUrl;
    UrlParser.parseParameters = parseParameters;

    return UrlParser;
})();