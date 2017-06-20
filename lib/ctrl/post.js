"use strict";

var Err = require("./error-http.js");
var Room = require("./room.js");

function dump(req) {
	req._dump();
}

module.exports = function (parts, req, res) {
	var base = parts.base;

	switch (parts.dir) {
	case "/":
		if (base) {
			return Err.notFound(res);
		}

		return Room.create(req, res);

	case "/join":
		dump(req);

		return Room.join(base, res);

	case "/bet":
		return Room.bet(base, res, req);

	case "/ready":
		return Room.ready(base, res, req);

	default:
		return Err.notFound(res);
	}
};
