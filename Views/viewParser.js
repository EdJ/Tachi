// This is based on John Resig's tiny template engine.
// I grabbed the code off Rick Strahl's weblog: http://www.west-wind.com/weblog/posts/2008/Oct/13/Client-Templating-with-jQuery
// Edited to allow the view function to include the results of deferreds.

ViewParser = module.exports = {
  parse: function(name, unParsedTemplate) {
    var extracted = this.extractProperties(unParsedTemplate);

    var properties = extracted.properties;
    var template = extracted.template;

    var str = "var d = new Deferred();var dC = 0;var p=[]," +
      "stackDeferred=function(index){ dC++;return function (r) { p[index] = r; dC--; if(!dC) {d.complete(p.join(''));}}}" +
      ",print=function(){p.push.apply(p,arguments);};with(obj){p.push('" +

    // Now a big crazy Regex.
    template.replace(/[\r\t\n]/g, " ")
      .replace(/'(?=[^%]*%>)/g, "\t")
      .split("'").join("\\'")
      .split("\t").join("'")
      .replace(/<%=(.+?)%>/g, "');if ($1 instanceof Deferred){$1.onComplete(stackDeferred(p.length));p.push('');}else{p.push($1);}p.push('")
      .split("<%").join("');")
      .split("%>").join("p.push('")

    + "');}if (!dC) {d.complete(p.join(''));}return d;";

    var fn = new Function("obj", "Html", str);
    var output = {
      properties: properties,
      view: fn
    };

    return output;
  },

  extractProperties: function(viewText) {
    var template = viewText;

    var unParsedProperties = '';

    var i = viewText.indexOf('<%!');
    if (~i) {
      var e = viewText.indexOf('%>');
      var toParse = viewText.substr(i, e + 2);
      template = viewText.substr(e + 2);

      unParsedProperties += toParse.replace(/<%!(.+?)%>/g, "$1") + ',';
    }

    unParsedProperties = unParsedProperties.substr(0, unParsedProperties.length - 2);

    properties = new Function("obj", "return {" + unParsedProperties + "};")();

    return {
      properties: properties,
      template: template
    };
  }
};