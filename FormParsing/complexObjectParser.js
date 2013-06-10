var FormValueParser = require('./formValueParser');

module.exports = (function () {
    var formValueParser = new FormValueParser();

    var parseComplexObject = function (toParse) {
        var output = {};

        for (var segment in toParse) {
            parseComplexObjectPart(segment, toParse[segment], output);
        }

        return output;
    };

    var parseComplexObjectPart = function (name, value, addTo) {
        var parts = name.split('[').join('.').split(']').join('').split('.');
        var current = addTo;
        for (var j = 0, l = parts.length - 1; j < l; j++) {
            var segment = parts[j];
            var intValue = parseInt(segment, 10);
            if (!isNaN(intValue)) {
                segment = intValue;
            }

            if (!current[segment]) {
                var next = parts[j + 1];
                var nextInt = parseInt(next, 10);
                if (!isNaN(nextInt)) {
                    current[segment] = [];
                } else {
                    current[segment] = {};
                }
            }

            current = current[segment];
        }

        // parseFloat is fairly greedy, so parse for a date first.
        var dateValue = formValueParser.parseDate(value);
        if (dateValue != 'Invalid Date') {
            value = dateValue;
        } else {
            var possibleInt = parseFloat(value);
            if (!isNaN(possibleInt) && /^-{0,1}\d*\.{0,1}\d+$/.test(value)) {
                value = possibleInt
            }
        }

        current[parts[parts.length - 1]] = value;
    };

    return function ComplexObjectParser() {
        this.parse = parseComplexObject;
    };
})();