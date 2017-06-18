"use strict";

var Path = require("path");
var Url = require("url");

var trailing = /\/+$/;

module.exports = function (str) {
	var pname = Url.parse(str).pathname.replace(trailing, "");

	return Path.parse(Url.resolve("/", pname));
};
