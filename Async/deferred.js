module.exports = (function () {
    function Deferred() {
        var stack = [];
        var outputData = {};
        var hasCompleted = false;

        this.onComplete = function (callback) {
            if (hasCompleted) {
                initiateCallback(callback);
                return this;
            }

            stack.push(callback);

            return this;
        };

        var initiateCallback = function (callback) {
            process.nextTick(function () {
                callback(outputData);
            });
        };

        this.complete = function (data) {
            if (hasCompleted) {
                return this;
            }

            hasCompleted = true;
            outputData = data;
            this.onCallback = initiateCallback;

            for (var i = 0, l = stack.length; i < l; i++) {
                initiateCallback(stack[i]);
            }

            return this;
        };

        this.isComplete = function () {
            return hasCompleted;
        };
    };

    Deferred.chain = function () {
        if (!arguments.length) {
            return;
        }

        var currentCallback = 0;
        var chainedFunctions = arguments;

        var callFunc = function (fromLast) {
            currentCallback++;

            var next = chainedFunctions[currentCallback - 1];

            if (!next) {
                return;
            }

            var possibleDeferred = next(fromLast, nextFunc);
            if (possibleDeferred instanceof Deferred) {
                possibleDeferred.onComplete(nextFunc);
            }
        };
   
        var nextFunc = function (fromLast) {
            if (fromLast instanceof Deferred) {
                fromLast.onComplete(nextFunc);
                return;
            };

            process.nextTick(function () {
                callFunc(fromLast);
            });
        };

        callFunc(0);

    };

    Deferred.when = function () {
        var callback = arguments[arguments.length - 1];

        if (arguments.length == 1) {
            callback();
        }

        var count = 0;
        var completionFunction = function () {
            count--;
            if (!count) {
                process.nextTick(callback);
            }
        };

        for (var i = arguments.length - 1; i--; ) {
            var deferred = arguments[i];

            if (deferred instanceof Function) {
                deferred = deferred(completionFunction);
            }

            if (!(deferred instanceof Deferred)) {
                count++;
                continue;
            }

            count++;
            deferred.onComplete(completionFunction);
        }
    };

    return Deferred;
})();