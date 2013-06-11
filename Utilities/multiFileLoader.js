var FileSystem = require('fs');

module.exports = (function () {
    return function MultiFileLoader(rootDirectory, perFileCallback, loaderMode) {
        var loadedFiles = {};

        var loadProcess = function (fileName, filePath) {
            FileSystem.readFile(filePath, 'UTF-8', function (err, data) {
                if (err) {
                    Logger.log(err);
                    throw err;
                }

                loadedFiles[fileName] = data;

                if (perFileCallback) {
                    perFileCallback(fileName, data);
                }
            });
        };

        var requireProcess = function (fileName, filePath) {
            var data = require('../../.' + filePath);

            if (perFileCallback) {
                perFileCallback(fileName, data);
            }
        };

        var process;
        if (!loaderMode || loaderMode == 'load') {
            process = loadProcess;
        } else {
            process = requireProcess;
        }

        var t = this;
        var loadDirectory = function (directory) {
            FileSystem.stat(directory, function (err, stat) {
                if (err) {
                    Logger.log('Could not load files from ' + directory);
                    Logger.log(err);
                    return;
                }

                FileSystem.readdir(directory, function (err, files) {
                    directoryLoadedCallback(directory, err, files);
                });
            });
        };

        var directoryLoadedCallback = function (directory, err, files) {
            if (err || !files) {
                throw err;
            }

            for (var i = 0; i < files.length; i++) {
                (function () {
                    var fileName = directory + '/' + files[i];
                    FileSystem.stat(fileName, function (err, stat) {
                        if (err) {
                            throw err;
                        }

                        if (stat.isDirectory()) {
                            loadDirectory(fileName);
                        } else if (stat.isFile()) {
                            var lowerCaseName = fileName.replace(rootDirectory, '');
                            lowerCaseName = lowerCaseName.replace(/\/([^\.]*).*/, '$1').toLowerCase();

                            process(lowerCaseName, fileName);
                        }
                    });
                })();
            }
        };

        this.load = function () {
            loadDirectory(rootDirectory);
        };
    };
})();