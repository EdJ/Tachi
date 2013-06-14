var MultiFileLoader = require('./Utilities/multiFileLoader');

var innerLoader = function(path, baseClass) {
    var suffix = 'Controller';
    this.path = path;
    this.cache = {};
    this.baseClass = baseClass;

    var cache = this.cache;

    this.load = function(className) {
        className = className.toLowerCase();
        if (cache[className]) {
            var instance = new cache[className]();
            this.prepare(className, instance);
            return instance;
        }

        return null;
    };

    this.prepare = function(className, instance) {
        this.attachBaseMethods(instance);
        this.addCaseInsensitivity(instance);
        instance._name = className.toLowerCase();
    };

    this.attachBaseMethods = function(instance) {
        Utils.extend(instance, baseClass);
    };

    this.addCaseInsensitivity = function(instance) {
        for (var action in instance) {
            var lower = action.toLowerCase();
            instance[lower] = instance[lower] || instance[action];
        }
    };

    var mfl = new MultiFileLoader(path, function(fileName, constructor) {
        Logger.log('Loaded ' + suffix + ': ' + fileName);

        var className = fileName.toLowerCase().replace(suffix.toLowerCase(), '');
        cache[className] = constructor;
    }, 'require');

    mfl.load();
}

ClassLoader = module.exports = (function() {
    return function ClassLoader(baseController) {
        var self = this;
        var ControllersPath = './Controllers/';

        var controllerLoader = new innerLoader(ControllersPath, baseController);

        var setServerVars = function(instance, request, response) {
            instance.Request = request;
            instance.Response = response;
        };

        this.getController = function(className, request, response) {
            var instance = controllerLoader.load(className);
            if (instance) {
                setServerVars(instance, request, response);
            }

            return instance;
        };

        return this;
    };
})();