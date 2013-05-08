// Basic async functionality written as a workshop demo during my time at Intechnica.
module.exports = (function () {

    // sets async to a function taking two parameters
    return function Async (functions, callback) {

        // Set the expected number of function callbacks
        var counter = functions.length;

        // Create a new array to hold the results of the functions
        var allData = [];

        // Define a counter callback
        var counterCallback = function (data) {
            // Decrement our counter once the callback is received
            counter--;
            // Add the returned data to the array of all the data
            allData.push(data);

            // Check if counter is zero, i.e. if we're in the last callback
            if (!counter) {
                // Send the collected data to the callback from the original async call
                callback(allData);
            }
        };

        // for each index in the functions array
        for (var i in functions) {
            // Set "func" to the function at the current index
            var func = functions[i];

            // Call the function, passing in our counter callback
            func(counterCallback);
        }

    };

})();