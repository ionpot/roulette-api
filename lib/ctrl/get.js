"use strict";

var Err = require("./error-http.js");
var Room = require("./room.js");

module.exports = function (parts, res) {
	var base = parts.base;

	switch (parts.dir) {
	case "/":
		if (base) {
			return Err.notFound(res);
		}

		return Room.list(res);

	case "/state":
		return Room.state(base, res);

	default:
		return Err.notFound(res);
	}
};
