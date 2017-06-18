"use strict";

var Err = require("./ctrl/error-http.js");
var get = require("./ctrl/get.js");
var post = require("./ctrl/post.js");

var parse = require("./parse/url.js");

module.exports = function (req, res) {
	var parts = parse(req.url);

	switch (req.method) {
	case "GET":
		return get(parts, res);

	case "POST":
		return post(parts, req, res);

	default:
		return Err.notImplemented(res);
	}
};
