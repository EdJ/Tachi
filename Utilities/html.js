var editorGenerator = require('../Helpers/editorGenerator');

module.exports = function Html(baseController) {
    var html = {};
    Utils.extend(html, baseController);

    html.EditorFor = editorGenerator.generateEditor;
    html.DisplayFor = editorGenerator.generateDisplay;

    html.Encode = function(data) {
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

    return html;
};