"use strict";

var Err = require("./error-http.js");
var Room = require("./room.js");

module.exports = function (parts, req, res) {
	var base = parts.base;

	switch (parts.dir) {
	case "/":
		if (base) {
			return Err.notFound(res);
		}

		return Room.create(req, res);

	case "/join":
		return Room.join(base, res);

	case "/bet":
		return Room.bet(base, req, res);

	case "/ready":
		return Room.ready(base, req, res);

	default:
		return Err.notFound(res);
	}
};
