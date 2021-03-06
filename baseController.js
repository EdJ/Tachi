var ViewsDirectory = './Views';

var ViewLoader = require('./Views/viewLoader');
ViewLoader = new ViewLoader([ViewsDirectory, __dirname + '/InternalViews']);

var ViewParser = require('./Views/viewParser');
var Dependency = require('./dependency');

var authHandler = require('./Auth/authHandler');

var HtmlHelper = require('./Utilities/html');

module.exports = (function() {
    var getHtmlView = function(viewName) {
        var view = ViewLoader.loadView(viewName);
        if (!view) {
            return null;
        }

        return ViewParser.parse(viewName, view);
    };

    var applyView = function(view, data, htmlHelper) {
        var appliedView = view.view(data, htmlHelper);
        if (view.properties.overView) {
            var toApply = {
                view: appliedView
            };

            Utils.extend(toApply, data);

            for (var prop in view.properties) {
                if (prop != 'overView') {
                    toApply[prop] = view.properties[prop];
                }
            }

            var overView = getHtmlView((view.properties.overView || '').toLowerCase());
            return applyView(overView, toApply, htmlHelper);
        }

        return appliedView;
    };

    var loadView = function(controller, viewName) {
        viewName = viewName.toLowerCase();
        var view = getHtmlView(controller._name + '/' + viewName);

        if (!view) {
            view = getHtmlView(viewName);
        }

        if (!view) {
            view = getHtmlView('shared/' + viewName);
        }

        return view;
    };

    var adjustModelContext = function(model) {
        return {
            model: model || {}
        };
    };

    var getParameters = function(controller, action, params) {
        if (typeof controller === 'object') {
            controller.controller = controller.controller || this._name;
            controller.action = (controller.action || 'index').toLowerCase();

            return controller;
        }

        params = params || action;
        if (typeof params !== 'object') {
            params = {};
        }

        if (typeof action !== 'string') {
            action = controller;
            controller = this._name;
        }

        params.controller = controller;
        params.action = (action || 'index').toLowerCase();

        return params;
    };

    return function BaseController(findRoute) {
        this.AsyncFinished = function(data) {
            this._promiseCallback(data);
        };

        this.View = function(view, model) {
            var c = adjustModelContext(model);
            var view = loadView(this, view);

            if (!view) {
                return;
            }

            return applyView(view, c, new HtmlHelper(this));
        };

        this.Partial = function(view, model) {
            var c = adjustModelContext(model);
            var view = loadView(this, view);
            if (!view) {
                return;
            }

            return view.view(c, new HtmlHelper(this));
        };

        this.Action = function(controller, action, params) {
            var actualParameters = getParameters.call(this, controller, action, params);

            var controller = this.classLoader.getController(actualParameters.controller);
            var action = actualParameters.action;

            if (controller && controller[action]) {
                var deferred = new Deferred();

                controller._promiseCallback = function(result) {
                    if (result instanceof Deferred) {
                        result.onComplete(deferred.complete);
                        return;
                    }

                    deferred.complete(result);
                };


                var value = controller[action](actualParameters);

                if (value && value instanceof Deferred) {
                    return value;
                } else if (value) {
                    deferred.complete(value);

                }

                return deferred;
            }

            return '';
        };

        this.ActionLink = function(controller, action, params) {
            var actualParameters = getParameters.call(this, controller, action, params);

            return findRoute(actualParameters);
        };

        this.Json = function(data) {
            return JSON.stringify(data);
        };

        this.RedirectToAction = function(controller, action, params) {
            var link = this.ActionLink(controller, action, params);

            return {
                _redirect: link
            }
        };

        this.Authenticate = function() {
            authHandler.authenticate(this);
        };
    };

})();