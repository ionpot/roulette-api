"use strict";

var Err = require("./ctrl/error-http.js");
var Rooms = require("./ctrl/rooms.js");

module.exports = function (parts, res) {
	switch (parts.dir) {
	case "/":
		return Rooms.list(res);

	case "/state":
		return Rooms.state(parts.base, res);

	default:
		return Err.notFound(res);
	}
};
