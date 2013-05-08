var editorGenerator = require('Tachi/Helpers/editorGenerator');

module.exports = (function () {
    var base = Utils.extend({}, BaseController);

    base.EditorFor = editorGenerator.generateEditor;
    base.DisplayFor = editorGenerator.generateDisplay;

    base.Encode = function (data) {
        if (typeof data === 'boolean') {
            return data ? 'Yes' : 'No';
        }

        if (data instanceof Date) {
            var day = ("0" + data.getDate()).slice(-2);
            var month = ("0" + (data.getMonth() + 1)).slice(-2);

            return day + '/' + month + '/' + data.getFullYear()
        }

        return (data + '').replace(/&/g, '&amp;').
         replace(/</g, '&lt;').
         replace(/>/g, '&gt;').
         replace(/"/g, '&quot;').
         replace(/'/g, '&#039;');
    };

    return base;
})();