module.exports = (function() {
    function Deferred() {
        var stack = [];
        var outputData = {};
        var hasCompleted = false;

        this.onComplete = function(callback) {
            if (hasCompleted) {
                initiateCallback(callback);
                return this;
            }

            stack.push(callback);

            return this;
        };

        var initiateCallback = function(callback) {
            process.nextTick(function() {
                callback(outputData);
            });
        };

        this.complete = function(data) {
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

        this.isComplete = function() {
            return hasCompleted;
        };
    };

    Deferred.chain = function(functions) {
        if (!arguments.length) {
            return;
        }
        
        if (!(functions instanceof Array)) {
            var newFunctions = Array.prototype.slice.call(arguments, 0, arguments.length );
            Deferred.chain(newFunctions);
            return;
        }

        var currentCallback = 0;

        var callFunc = function(fromLast) {
            currentCallback++;

            var next = functions[currentCallback - 1];

            if (!next) {
                return;
            }

            var possibleDeferred = next(fromLast, nextFunc);
            if (possibleDeferred instanceof Deferred) {
                possibleDeferred.onComplete(nextFunc);
            }
        };

        var nextFunc = function(fromLast) {
            if (fromLast instanceof Deferred) {
                fromLast.onComplete(nextFunc);
                return;
            };

            process.nextTick(function() {
                callFunc(fromLast);
            });
        };

        callFunc(0);

    };

    Deferred.when = function(functions, callback) {
        if (arguments.length == 1 && functions) {
            functions();
        }
        
        if (!(functions instanceof Array)) {
            var newFunctions = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            var newCallback = arguments[arguments.length - 1];
            return Deferred.when(newFunctions, newCallback);
        }

        var count = 0;
        var completionFunction = function() {
            count--;
            if (!count) {
                process.nextTick(callback);
            }
        };

        for (var i = functions.length; i--;) {
            var deferred = functions[i];

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