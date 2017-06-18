"use strict";

var Err = require("./error-http.js");
var Room = require("./room.js");

module.exports = function (parts, req, res) {
	switch (parts.dir) {
	case "/":
		return Room.create(req, res);

	case "/join":
		return Room.join(parts.base, req, res);

	case "/bet":
		return Room.bet(parts.base, req, res);

	case "/ready":
		return Room.ready(parts.base, req, res);

	default:
		return Err.notFound(res);
	}
};
