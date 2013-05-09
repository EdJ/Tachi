module.exports = (function () {
    function Deferred() {
        var stack = [];
        var outputData = {};
        var hasCompleted = false;

        this.onComplete = function (callback) {
            if (hasCompleted) {
                if (stack.length) {
                    stack.push(callback);
                } else {
                    initiateCallback(callback);
                }
                
                return;
            }

            stack.push(callback);
        };

        var initiateCallback = function (callback) {
            process.nextTick(function () {
                callback(outputData);
            });
        };

        this.complete = function (data) {
            if (hasCompleted) {
                return;
            }

            hasCompleted = true;
            outputData = data;
            this.onCallback = initiateCallback;

            for (var i = 0, l = stack.length; i < l; i++) {
                initiateCallback(stack[i]);
            }
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

            var possibleDeferred = chainedFunctions[currentCallback - 1](fromLast, nextFunc);
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
        var count = 0;
        for (var i = arguments.length - 1; i--; ) {
            var deferred = arguments[i];

            if (!(deferred instanceof Deferred)) {
                continue;
            }

            count++;
            deferred.onComplete(function () {
                count--;
                if (!count) {
                    process.nextTick(callback);
                }
            });
        }
    };

    return Deferred;
})();