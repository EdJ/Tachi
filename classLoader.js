var BaseController = require('./baseController');
var MultiFileLoader = require('./Utilities/multiFileLoader');

var innerLoader = function (path, extension, suffix, baseClass) {
    this.suffix = suffix;
    this.path = path;
    this.extension = extension;
    this.cache = {};
    this.baseClass = baseClass;

    var cache = this.cache;

    this.load = function (className) {
        className = className.toLowerCase();
        if (cache[className]) {
            var instance = new cache[className]();
            this.prepare(className, instance);
            return instance;
        }

        return null;
    };

    this.prepare = function (className, instance) {
        this.attachBaseMethods(instance);
        this.addCaseInsensitivity(instance);
        instance._name = className.toLowerCase();
    };

    this.attachBaseMethods = function (instance) {
        Utils.extend(instance, baseClass);
    };

    this.addCaseInsensitivity = function (instance) {
        for (var action in instance) {
            var lower = action.toLowerCase();
            instance[lower] = instance[lower] || instance[action];
        }
    };

    var mfl = new MultiFileLoader(path, function (fileName, constructor) {
        Logger.log('Loaded ' + suffix + ': ' + fileName);

        var className = fileName.toLowerCase().replace(suffix.toLowerCase(), '');
        cache[className] = constructor;
    }, 'require');

    mfl.load();
}

ClassLoader = module.exports = (function () {
    var self = this;
    var ControllersPath = './Controllers/';
    var RepositoriesPath = './Repositories/';
    var ServicesPath = './Services/';
    var NodeExt = '.js';

    var controllerLoader = new innerLoader(ControllersPath, NodeExt, 'Controller', BaseController);
    var serviceLoader = new innerLoader(ServicesPath, NodeExt, 'Service', {});
    var repositoryLoader = new innerLoader(RepositoriesPath, NodeExt, 'Repository', {});

    var setServerVars = function (instance, request, response) {
        instance.Request = request;
        instance.Response = response;
    };

    var getRepository = function (className, request, response) {
        var instance = repositoryLoader.load(className);

        return instance;
    };

    var getController = function (className, request, response) {
        var instance = controllerLoader.load(className);
        if (instance) {
            setServerVars(instance, request, response);
            resolveDependencies(instance);
        }

        return instance;
    };
    
    var getService = function (className, request, response) {
        var instance = serviceLoader.load(className);
        if (instance) {
            setServerVars(instance, request, response);
            resolveDependencies(instance);
            instance._classLoader = this;
        }

        return instance;
    }

    var resolveDependencies = function (instance) {
        if (!instance) {
            return;
        }

        var dependencies = instance.dependencies;
        if (dependencies) {
            for (var dependency in dependencies) {
                var dep = dependencies[dependency];
                var prop = dep.name;
                var d = dep.data;
                var instantiated;
                switch (d.type) {
                    case 'Controller':
                        instantiated = getController(d.name);
                        break;
                    case 'Repository':
                        instantiated = getRepository(d.name);
                        break;
                    case 'Service':
                        instantiated = getService(d.name);
                        break;
                }

                resolveDependencies(instantiated);

                instance[prop] = instantiated;
            }
        }
    };

    return {
        ControllersPath: ControllersPath,
        NodeExt: NodeExt,
        serviceLoader: serviceLoader,
        controllerLoader: controllerLoader,
        repositoryLoader: repositoryLoader,
        resolveDependencies: resolveDependencies,

        getService: getService,
        getController: getController,
        getRepository: getRepository
    };
})();