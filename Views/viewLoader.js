var MultiFileLoader = require('../Utilities/multiFileLoader');

ViewLoader = module.exports = function ViewLoader(viewsDirectory) {
    var views = {};

    var loadViews = function (directoryToLoad) {
        var mfl = new MultiFileLoader(directoryToLoad, function (fileName, data) {
            Logger.log('Loaded View: ' + fileName);

            views[fileName] = data;
        });

        mfl.load();
    };

    var loader = {
        loadView: function (viewName) {
            if (views[viewName]) {
                return views[viewName];
            }

            return null;
        },
        loadAvailableViews: function () {
            if (viewsDirectory instanceof Array) {
                for (var i = viewsDirectory.length; i--;) {
                    loadViews(viewsDirectory[i]);
                }
            } else {
                loadViews(viewsDirectory);
            }
        }
    };

    loader.loadAvailableViews();

    return loader;
};