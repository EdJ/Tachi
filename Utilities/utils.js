var qs = require('querystring');

module.exports = {
    getQsValue: function (url, value) {
        var qsIndex = url.indexOf('?');
        if (! ~qsIndex) {
            return;
        }

        var unParsedQs = req.url.substring(qsIndex + 1);
        var parsedQs = qs.parse(unParsedQs);
        if (!parsedQs[value]) {
            return;
        }

        return parsedQs[value];
    },
    extend: function () {
        // This is a subsection of the jQuery.extend function with deep-copy functionality omitted.
        var t = arguments[0] || {};
        if (typeof t === 'boolean') {
            return arguments[1] || {};
        }

        if (typeof t !== 'object') {
            t = {};
        }

        var l = arguments.length;
        var o, name, src, copy;
        for (var i = l; i--; ) {
            if ((o = arguments[i]) != null) {
                for (name in o) {
                    src = t[name];
                    copy = o[name];
                    if (t === copy) {
                        // This prevents infinite recursive copying.
                        continue;
                    }

                    if (copy !== undefined) {
                        t[name] = copy;
                    }
                }
            }
        }

        return t;
    }
}