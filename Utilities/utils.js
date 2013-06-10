module.exports = {
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
                    if (t === copy || o === copy) {
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