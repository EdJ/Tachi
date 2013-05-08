var fs = require('fs');

module.exports = (function () {
    var getFileName = function (repoName) {
        var dir = 'data';

        var fileName = './' + dir + '/' + repoName + '-repo.js';

        return fileName;
    };

    var loadData = function (repoName, callback) {
        var repoLocation = getFileName(repoName);

        fs.readFile(repoLocation, function (err, data) {
            if (err) {
                Logger.log({
                    status: Logger.Status.Error,
                    message: [
                        'Error while loading from: ' + repoLocation,
                        err
                        ]
                });

                return [];
            }

            var data = JSON.parse(data);

            process.nextTick(function () {
                callback(data);
            });
        });
    };

    var saveData = function (repoName, list) {
        var s = JSON.stringify(list);

        var repoLocation = getFileName(repoName);

        fs.writeFile(repoLocation, s, function (err) {
            if (err) {
                Logger.log({
                    status: Logger.Status.Error,
                    message: [
                        'Error while loading from: ' + repoLocation,
                        err
                        ]
                });

                return;
            };

            Logger.log('Data loaded from: ' + repoLocation);
        });
    };

    return {
        load: loadData,
        save: saveData
    };
})();
