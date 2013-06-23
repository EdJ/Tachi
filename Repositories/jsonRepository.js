var fs = require('fs');

module.exports = function (connectionDetails) {
    connectionDetails = connectionDetails || {};

    var baseDirectory = './' + (connectionDetails.baseDirectory || 'data');

    var dataDirectoryExists = fs.existsSync(baseDirectory);
    if (!dataDirectoryExists) {
        fs.mkdirSync(baseDirectory);
    }

    var getFileName = function (repoName) {
        var fileName = baseDirectory + '/' + repoName + '-repo.js';

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
        var deferred =  new Deferred();

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

                deferred.complete(false);

                return;
            };

            Logger.log('Data loaded from: ' + repoLocation);

            deferred.complete(true);
        });

        return deferred;
    };

    var _allItems = {};

    return function JsonRepository(repoName) {
        var _internalList = _allItems[repoName] || {};
        var deferred = loadData(repoName);

        deferred.onComplete(function (data) {
            var item;
            for (var i = data.length; i--; ) {
                item = data[i];
                _internalList[item._id] = item;
            }

            _allItems[repoName] = _internalList;
        });

        var getList = function () {
            var output = [];
            for (var _id in _internalList) {
                output.push(_internalList[_id]);
            }

            output.reverse();

            return output;
        };

        this.get = function (_id) {
            var deferred = new Deferred();

            deferred.complete(_internalList[_id] || _internalList[_id + '']);

            return deferred;
        };

        this.update = function (post) {
            _internalList[post._id] = post;

            return saveData(repoName, getList());
        };

        this.add = function (post) {
            var nextPostId = 0;

            for (var postId in _internalList) {

                var _id = _internalList[postId]._id;

                if (_id > nextPostId) {
                    nextPostId = _id;
                }
            }

            nextPostId++;

            post._id = nextPostId;
            _internalList[post._id] = post;

            var saveDeferred = saveData(repoName, getList());

            var deferred = new Deferred();
            saveDeferred.onComplete(function() {
                deferred.complete(post._id);
            });

            return deferred;
        };

        this.remove = function (_id) {
            delete _internalList[_id];

            return saveData(repoName, getList());
        };

        this.getAll = function () {
            var deferred = new Deferred();
            
            var items = getList();
            deferred.complete(items);

            return deferred;
        };
    };
};
