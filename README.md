## Tachi
[![Build Status](https://secure.travis-ci.org/EdJ/Tachi.png?branch=master)](https://travis-ci.org/EdJ/Tachi)

Node.js MVC framework for seriously rapid application development.

## Overview

Quickly get up and running with a node.js MVC app, using a simple view syntax and an ASP.NET MVC-style project layout. Tachi is all about ease of rapid development, with a simple mindset, easily expandable feature set, and a number of features to help increase web application speed.

Catch me on twitter (http://twitter.com/sigmoidfx) for more info!

## Quick Start
```bash
npm install tachi
```

Grab a copy of the twitter bootstrap template for Tachi (http://github.com/EdJ/Tachi-bootstrap), or just use the following code:

Controllers/DefaultController.js:
```js
module.exports = {
	index: function () {
		return this.Json({ message: 'Hi! Welcome to Tachi!'})
	}
}
```

index.js:
```js
var TachiHandler = require('Tachi');

var routeData = {
	routes: [
		{
			url: '/',
			data: {
				controller: 'DefaultController',
				action: 'index'
			}
	  	}
	],
	defaultRoute: '/'
};

var settings = {
    port: 8080
};

var handler = new TachiHandler(settings, routeData);
handler.start();
```

## Features

* Solid, understandable routing
* Familiar MVC model (View(), RedirectToAction(), etc.)
* Simple, fast templating engine
* Minimal work required to quickly build complex web apps

## License

Copyright (c) 2013 Ed J <ed@ed-j.co.uk>

Do what you want with the code; No warranty of any kind is given assuming its use.