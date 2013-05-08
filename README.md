## Tachi

Node.js MVC framework for seriously rapid application development.

## Overview

Quickly get up and running with a node.js MVC app, using a simple view syntax and an ASP.NET MVC-style project layout. Tachi is all about ease of rapid development, with a simple mindset, easily expandable feature set, and a number of features to help increase web application speed.

Catch me on twitter (http://twitter.com/sigmoidfx) for more info!

## Quick Start

Grab a copy of the twitter bootstrap template for Tachi (http://github.com/EdJ/Tachi-bootstrap), or just use the following code:

Controllers/DefaultController.js:
```js
	module.exports = {
		this.index = function () {
			return this.Json({ message: 'Hi! Welcome to Tachi!'})
		}
	}
```

index.js:
```js
	var TachiHandler = require('Tachi');

	var routes = {
		routes: [
			{
				url: '/',
				data: {
				controller: 'DefaultController',
				action: 'index'
			}
	  	}
	  ]
	};

	var settings = {
	    logger: 'Tachi/Logging/consoleLogger',
	    defaultRoute: '/Error?errorCode=404',
	    appRoot: __dirname,
	    port: 8080
	};

	var handler = new TachiHandler(settings, routes);
	handler.start();
```

## Features

* Solid, understandable routing
* Familiar MVC model (View(), RedirectToAction(), etc.)
* Simple, fast templating engine.
* Minimal work required to quickly build complex web apps

## License

Copyright (c) 2013 Ed J <ed@ed-j.co.uk>

Do what you want with the code; No warranty of any kind is given assuming its use.