var fs = require('fs');

module.exports = (function () {
    var getFileName = function (repoName) {
        var dir = 'data';

        var fileName = './' + dir + '/' + repoName + '-repo.js';

        return fileName;
    };

    var loadData = function (repoName) {
        var repoLocation = getFileName(repoName);

        var deferred = new Deferred();

        fs.readFile(repoLocation, function (err, data) {
            if (err) {
                Logger.log({
                    status: Logger.Status.Error,
                    message: [
                        'Error while loading from: ' + repoLocation,
                        err
                        ]
                });

                deferred.complete([]);

                return;
            }

            var data = JSON.parse(data);

            deferred.complete(data);
        });

        return deferred;
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
