// Basic async functionality originally written as a workshop demo during my time at Intechnica.
module.exports = (function() {
    // sets async to a function taking two parameters
    return function Async(functions, callback) {
        // If there's nothing to do, do nothing.
        if (!functions) {
            return;
        }

        // If we were passed the functions as parameters, not an array, restart with them as an array.
        if (!(functions instanceof Array)) {
            var newFunctions = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            var newCallback = arguments[arguments.length - 1];
            Async(newFunctions, newCallback);
        }

        // Set the expected number of function callbacks
        var counter = functions.length;

        // Create a new array to hold the results of the functions
        var allData = [];

        // Define a counter callback
        var counterCallback = function(index) {
            // Return a callback that sets the data at the correct array index.
            // This is done to ensure the data is correctly ordered when we return.
            return function(data) {
                // Decrement our counter once the callback is received
                counter--;
                // Add the returned data to the array of all the data
                allData[index] = data;

                // Check if counter is zero, i.e. if we're in the last callback
                if (!counter) {
                    // Send the collected data to the callback from the original async call
                    callback(allData);
                }
            };
        };

        // for each index in the functions array
        for (var i in functions) {
            // Set "func" to the function at the current index
            var func = functions[i];

            // Get the correct callback function for this function.
            var functionSpecificCallback = counterCallback(i);

            // Call the function, passing in our counter callback
            func(functionSpecificCallback);
        }
    };
})();