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

    return function JsonRepository(repoName) {
        var _internalList = {};

        var deferred = loadData(repoName);

        deferred.onComplete(function (data) {
            var item;
            for (var i = data.length; i--; ) {
                item = data[i];
                _internalList[item.id] = item;
            }
        });

        var getList = function () {
            var output = [];
            for (var id in _internalList) {
                output.push(_internalList[id]);
            }

            output.reverse();

            return output;
        };

        this.get = function (id) {
            return _internalList[id] || _internalList[id + ''];
        };

        this.update = function (post) {
            _internalList[post.id] = post;

            saveData(repoName, getList());
        };

        this.add = function (post) {
            var nextPostId = 0;

            for (var postId in _internalList) {

                var id = _internalList[postId].id;

                if (id > nextPostId) {
                    nextPostId = id;
                }
            }

            nextPostId++;

            post.id = nextPostId;
            _internalList[post.id] = post;

            saveData(repoName, getList());

            return post.id;
        };

        this.remove = function (id) {
            delete _internalList[id];

            saveData(repoName, getList());
        };

        this.getAll = function () {
            return getList();
        };
    };
})();
