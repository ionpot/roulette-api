"use strict";

var http = require("http");

var router = require("./lib/router.js");

var port = +process.argv[2] || 8080;

http.createServer(router).listen(port, function () {
	console.log("Listening on port %d.", port);
});
