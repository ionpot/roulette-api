"use strict";

var Err = require("./error-http.js");
var Room = require("./room.js");

module.exports = function (parts, res) {
	switch (parts.dir) {
	case "/":
		return Room.list(res);

	case "/state":
		return Room.state(parts.base, res);

	default:
		return Err.notFound(res);
	}
};
