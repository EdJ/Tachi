var ViewLoader = require('../Views/viewLoader');
ViewLoader = new ViewLoader(__dirname + '/../InternalViews');

var ViewParser = require('../Views/viewParser');

module.exports = (function() {
    var generateEditor = function(toGenerateFor, name, partName, originalObject, displaying) {
        displaying = displaying || false;

        partName = partName === undefined ? name : partName;
        var output = [];
        var deferreds = [];
        var stackDeferred = function() {
            var index = output.length;
            output.push('');

            return function(result) {
                output[index] = result;
            }
        };

        if (toGenerateFor instanceof Array) {
            for (var i = 0, l = toGenerateFor.length; i < l; i++) {
                var part = generateEditor(toGenerateFor[i], name + '[' + i + ']', i, originalObject, displaying);
                part.onComplete(stackDeferred());
                deferreds.push(part);
            }
        } else {
            var type = typeof toGenerateFor;
            if (toGenerateFor instanceof Date) {
                type = 'date';
            }

            if (type === 'object') {
                for (var prop in toGenerateFor) {
                    if (!toGenerateFor.hasOwnProperty(prop) || prop[0] === '_') {
                        continue;
                    }

                    var part = generateEditor(toGenerateFor[prop], name + '.' + prop, prop, originalObject, displaying);

                    part.onComplete(stackDeferred());
                    deferreds.push(part);
                }
            } else {
                var additionalInfo = originalObject._additional || {};

                var model = {
                    name: name,
                    value: toGenerateFor,
                    label: partName
                };

                if ((additionalInfo[name] && additionalInfo[name].preventEditing) ||
                    (additionalInfo[partName] && additionalInfo[partName].preventEditing)) {
                    type = 'hidden';
                } else if ((additionalInfo[name] && additionalInfo[name].subAction) ||
                    (additionalInfo[partName] && additionalInfo[partName].subAction)) {
                    Utils.extend(model, (additionalInfo[name] || additionalInfo[partName]).subAction);
                    model.editing = !displaying;

                    var subActionPart = Html.Action(model);

                    if (subActionPart instanceof Deferred) {
                        subActionPart.onComplete(stackDeferred());

                        deferreds.push(subActionPart);
                    } else {
                        output.push(subActionPart);
                    }
                } else {
                    var viewName = (displaying ? 'display/' : 'editor/') + type;
                    var view = ViewLoader.loadView(viewName);
                    if (!view) {
                        viewName = displaying ? 'display/string' : 'editor/string';
                        view = ViewLoader.loadView(viewName);
                    }

                    var parsedView = ViewParser.parse(viewName, view);

                    var part = parsedView.view(model);
                    part.onComplete(stackDeferred());
                    deferreds.push(part);
                }
            }
        }

        var deferred = new Deferred();

        Deferred.when(deferreds, function() {
            deferred.complete(output.join(''));
        });

        return deferred;
    };

    return {
        generateEditor: function(toGenerateFor, name, partName) {
            return generateEditor(toGenerateFor, name, partName, toGenerateFor, false);
        },
        generateDisplay: function(toGenerateFor, name, partName) {
            return generateEditor(toGenerateFor, name || '', partName, toGenerateFor, true);
        }
    };
})();