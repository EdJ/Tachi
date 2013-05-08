// This is based on John Resig's tiny template engine.
// I grabbed the code off Rick Strahl's weblog: http://www.west-wind.com/weblog/posts/2008/Oct/13/Client-Templating-with-jQuery
// Edited to work a bit better with node (we don't have DOM in this context).

ViewParser = module.exports ={
  cache : {},

  parse : function(name, unParsedTemplate) {
    if (this.cache[name]) {
      return this.cache[name];
    }

    var overView = '';
    var extracted = this.extractProperties(unParsedTemplate);

    var properties = extracted.properties;
    var template = extracted.template;

    var str = "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+

    // Now a big crazy Regex.
    template.replace(/[\r\t\n]/g," ")
    .replace(/'(?=[^%]*%>)/g,"\t")
    .split("'").join("\\'")
    .split("\t").join("'")
    .replace(/<%=(.+?)%>/g,"',$1,'")
    .split("<%").join("');")
    .split("%>").join("p.push('")
    
    + "');}return p.join('');";

    var fn = new Function("obj", str);
    var output = { properties : properties, view : fn };
    this.cache[name] = output;

    return output;
  },

  extractProperties : function (viewText) {
    var template = viewText;

    var unParsedProperties = '';

    var i = viewText.indexOf('<%!');
    if (~i) {
      var e = viewText.indexOf('%>');
      var toParse = viewText.substr(i, e + 2);
      template = viewText.substr(e + 2);

      unParsedProperties += toParse.replace(/<%!(.+?)%>/g,"$1") + ',';
    }

    unParsedProperties = unParsedProperties.substr(0, unParsedProperties.length -2);

    properties = new Function("obj", "return {" + unParsedProperties + "};")();

    return { properties : properties, template : template };
  }
};
