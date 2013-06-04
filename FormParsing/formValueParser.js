module.exports = (function () {
    var parseDate = function (input) {
        input = input + '';

        // Have to check this, or we greedily parse anything that contains 3 numbers.
        if (!/[\/| |-]/.test(input)) {
            return 'Invalid Date';
        }

        // Force the parse as a string.
        var parts = (input).match(/(\d+)/g);
        if (!parts || parts.length < 3) {
          return 'Invalid Date';
        }

        return new Date(parts[0], parts[1]-1, parts[2]);
    };

    return function FormSegmentParser() {
        this.parseDate = parseDate;
    };
})();

