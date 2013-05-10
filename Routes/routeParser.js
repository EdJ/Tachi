var qs = require('querystring');

module.exports = (function () {
    var patterns = [];
    var statics = [];
    var bestMatchForUrl = '';

    var parsePattern = function (pattern) {
        var f = ["var o = {};var v=true;with(str) {var t=str;var n=0;"];

        var arr = pattern.split(/\{|\}/g);

        var l = arr.length;

        for (var i = 0; i < l; i++) {
            var c = arr[i];
            var v = arr[i + 1];
            if (!v) {
                continue;
            }

            f.push("t=t.substring(");
            f.push(c.length);
            f.push(");n=t.indexOf('");
            f.push(arr[i + 2]);
            f.push("');v=v&&!!~n;o['");
            f.push(v);
            f.push("']=t.substring(0,n);t=t.substring(n);");
            i++;
        }

        f.push("};return v ? o : v;");

        return new Function("str", f.join(''));
    };

    var getParameters = function (pattern) {
        var items = pattern.replace(/[^\{]*\{([^\}]*)\}[^\{]*/g, '$1;').split(';');
        if (items.length && !items[items.length - 1]) {
            items.pop();
        }

        return items;
    };

    var addPattern = function (pattern) {
        if (!pattern.url) {
            pattern = {
                url: pattern,
                data: {}
            }
        }

        pattern.func = parsePattern(pattern.url);
        pattern._parameters = getParameters(pattern.url);
        patterns.push(pattern);
    };

    var findBestMatchingUrl = function (params) {
        var paramKeys = [];
        for (var key in params) {
            if (params[key]) {
                paramKeys.push(key);
            }
        }

        if (!paramKeys.length) {
            return '';
        }

        var bestMatch = '';
        var currentBest = 0;
        for (var i = patterns.length; i--; ) {
            var pattern = patterns[i];
            var patternItems = pattern._parameters;

            if (patternItems.length > paramKeys.length) {
                console.log(paramKeys);
                console.log(pattern);
                continue;
            }

            var matches = 0;
            for (var j = paramKeys.length; j--; ) {
                if (!! ~patternItems.indexOf(paramKeys[j])) {
                    matches++;
                }
            }

            if (matches > currentBest && matches == patternItems.length) {
                currentBest = matches;
                bestMatch = pattern.url;
            }
        }

        return bestMatch;
    };

    var getUrl = function (params) {
        var bestMatch = findBestMatchingUrl(params);
        var qs = [];

        for (var key in params) {
            var toMatch = '{' + key + '}';
            if (!bestMatch.match(toMatch)) {
                qs.push(key + '=' + encodeURIComponent(params[key]));
            } else {
                bestMatch = bestMatch.replace(toMatch, params[key]);
            }
        }

        var qsString = '';

        if (qs.length) {
            qsString = '?' + qs.join('&');
        }

        return bestMatch + qsString;
    };

    var addStatic = function (pattern) {
        statics.push(pattern);
    };

    var checkStatics = function (pathWithQs) {
        if (! ~pathWithQs.indexOf('.') || !! ~pathWithQs.indexOf('?')) {
            return false;
        }

        for (var i = statics.length; i--; ) {
            var st = pathWithQs.indexOf(statics[i]);
            if (!st) {
                return true;
            }
        }

        return false;
    };

    var parse = function (pathWithQs) {
        var isStatic = checkStatics(pathWithQs);
        if (isStatic) {
            return {
                _isStatic: true
            };
        }

        var split = pathWithQs.split('?');
        if (!split.length) {
            return {};
        }

        var path = split[0];
        if (path.substr(-1) != '/') {
            path += '/';
        }

        var qsdata = qs.parse(split[1] || '');
        var fn;
        var pattern;
        var o;

        for (var i = patterns.length; i--; ) {
            pattern = patterns[i];
            fn = pattern.func;

            o = fn(path);
            if (!o) {
                continue;
            }

            Utils.extend(o, pattern.data);
            Utils.extend(o, qsdata);

            o._isStatic = false;
            return o;
        }
    };

    return function RouteParser(routes, statics) {
        routes = routes || [];
        statics = statics || [];
        this.addRoute = addPattern;
        this.addStatic = addStatic;
        this.parse = parse;
        this.getUrl = getUrl;

        for (var i = routes.length; i--; ) {
            this.addRoute(routes[i]);
        }

        for (var i = statics.length; i--; ) {
            this.addStatic(statics[i]);
        }
    };
})();
