module.exports = (function () {
    var parseComplexObject = function (toParse) {
        var output = {};

        for (var segment in toParse) {
            parseComplexObjectPart(segment, toParse[segment], output);
        }

        return output;
    };

    var parseDate = function (input) {
        // Force the parse as a string.
        var parts = (input + '').match(/(\d+)/g);
        if (!parts) {
          return 'Invalid Date';
        }

        return new Date(parts[0], parts[1]-1, parts[2]);
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

        // parseInt is fairly greedy, so parse for a date first.
        var dateValue = parseDate(value);
        if (dateValue != 'Invalid Date') {
            value = dateValue;
        } else {
            var possibleInt = parseInt(value, 10);
            if (!isNaN(possibleInt)) {
                value = possibleInt
            }
        }

        current[parts[parts.length - 1]] = value;
    };

    return {
        parse: parseComplexObject
    };
})();