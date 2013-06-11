module.exports = (function() {
	var getParameters = function(pattern) {
		if (!pattern || pattern == '/' || !/\{(.*)\}/.test(pattern)) {
			return [];
		}

		if (pattern[pattern.length - 1] !== '/') {
			pattern += '/';
		}

		var items = pattern.replace(/[^\{]*\{([^\}]*)\}[^\{]*/g, '$1;').split(';');
		if (items.length && !items[items.length - 1]) {
			items.pop();
		}

		return items;
	};

	var generateParseFunction = function(pattern) {
		var outputFunction = ["var o = {};var v=true;with(str) {var t=str;var n=0;"];

		var patternSegments = pattern.split(/\{|\}/g);

		var patternSegmentsCount = patternSegments.length;

		for (var index = 0; index < patternSegmentsCount; index++) {
			var variableName = patternSegments[index + 1];
			if (!variableName) {
				continue;
			}

			var constant = patternSegments[index];
			outputFunction.push("t=t.substring(");
			outputFunction.push(constant.length);
			outputFunction.push(");");

			var nextDivider = patternSegments[index + 2];
			if (!nextDivider) {
				outputFunction.push('n=t.length;')
			} else {
				outputFunction.push("n=t.indexOf('");
				outputFunction.push(nextDivider);
				outputFunction.push("');");
			}

			outputFunction.push("v=v&&!!~n;o['");
			outputFunction.push(variableName);
			outputFunction.push("']=t.substring(0,n);t=t.substring(n);");
			
			// We skip on two indexes as every second index is always a separator.
			index++;
		}

		outputFunction.push("};return v ? o : v;");

		return new Function("str", outputFunction.join(''));
	};

	var RouteParser = function RouteParser(pattern) {
        if (!pattern.url) {
            pattern = {
                url: pattern,
                data: {}
            }
        }

        pattern.func = generateParseFunction(pattern.url);
        pattern._parameters = getParameters(pattern.url);
        return pattern;
	};

	// Expose methods for test purposes.
	RouteParser.getParameters = getParameters;
	RouteParser.generateParseFunction = generateParseFunction;

	return RouteParser;
})();