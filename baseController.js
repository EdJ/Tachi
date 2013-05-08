var ViewsDirectory = './Views';

var ViewLoader = require('./Views/viewLoader');
ViewLoader = new ViewLoader([ ViewsDirectory, __dirname + '/InternalViews' ]);

var ViewParser = require('./Views/viewParser');
var Dependency = require('./dependency');

BaseController = module.exports = (function () {

    var getHtmlView = function (viewName) {
        var view = ViewLoader.loadView(viewName);
        if (!view) {
            return null;
        }

        return ViewParser.parse(viewName, view);
    };

    var applyView = function (view, data) {
        var appliedView = view.view(data);
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
            return applyView(overView, toApply);
        }

        return appliedView;
    };

    var loadView = function (controller, viewName) {
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

    var adjustModelContext = function (model) {
        return {
            model: model || {}
        };
    };

    return {
        AsyncFinished: function (data) {
            this._promiseCallback(data);
        },
        View: function (view, model) {
            var c = adjustModelContext(model);
            var view = loadView(this, view);

            if (!view) {
                return;
            }

            return applyView(view, c);
        },
        Partial: function (view, model) {
            var c = adjustModelContext(model);
            var view = loadView(this, view);
            if (!view) {
                return;
            }

            return view.view(c);
        },
        Action: function (data) {
            if (!data) {
                data = {};
            }

            var controller = ClassLoader.getController(data.controller);
            var action = data.action || 'index';

            if (controller && controller[action]) {
                return controller[action](data);
            }

            return '';
        },
        ActionLink: function (controller, action, params) {
            if (!params && typeof controller !== 'string') {
                params = controller;
                controller = params.controller;
            }

            params = params || {};

            params.action = params.action || action;
            params.controller = params.controller || controller;

            return Router.getActionLink(params);
        },
        Json: function (data) {
            return JSON.stringify(data);
        },
        RedirectToAction: function (controller, action, params) {
            var link = this.ActionLink(controller, action, params);

            return {
                _redirect: link
            }
        }
    };

})();
