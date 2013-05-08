var qs = require('querystring');

var Routes = exports.Routes = new (function() {
  var routes = {},
      defaultRoutePattern = '/',
      defaultRouteHandler = function() {},
      parsedPatternData = {},
      staticPaths = [];

  this.add = function (pattern, func) {
    routes[pattern] = func;
    return this;
  };

  this.setDefault = function (pattern, func) {
    defaultRoutePattern = pattern;
    defaultRouteHandler = func;
    return this;
  };

  this.addStaticDirectory = function (path) {
    path = path || '';
    if (path.substr(-1) != '/') {
      path += '/';
    }

    staticPaths.push(path);

    return this;
  };

  this.get = function() {
    return routes;
  };

  this.getStaticPaths = function() {
    return staticPaths;
  };

  this.getDefault = function () {
    return { 
      pattern : defaultRoutePattern,
      func : defaultRouteHandler
    };
  };

  this.parseQueryString = function (qs) {
    return qs.parse(qs);
  };

  this.parsePattern = function (pattern, url) {
    var patternData;
    if (!(patternData = parsedPatternData[pattern])) {
      var params = [];
      var result = pattern.replace(/\{(.*?)\}/g, function (match, sub1, pos, whole) {
        params.push(sub1);
    return '([^\/]+?)';
      });

      result = '^' + result + '(\\/?\$|\\/?\\?.*$)';
      parsedPatternData[pattern] = patternData = {
        regex : new RegExp(result),
        params : params
      };
    }

    var counter = 0,
        urlParts = null,
    regex = patternData.regex,
    params = patternData.params;

    url.replace(regex, function (match) {
      urlParts = {};
      var i=0;

      for (; i<params.length; i++) {
        urlParts[params[i]] = arguments[i+1];
      }

      urlParts._qs = Routes.parseQueryString((arguments[i+1] || '').replace(/^\/?\??/,""));

    });

    return urlParts;
  };

});

