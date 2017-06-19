"use strict";

var Err = require("./error-http.js");
var Room = require("./room.js");

function dump(req) {
	req._dump();
}

module.exports = function (parts, req, res) {
	var base = parts.base;
	var roomNo = base|0;

	switch (parts.dir) {
	case "/":
		if (base) {
			return Err.notFound(res);
		}

		return Room.create(req, res);

	case "/join":
		dump(req);

		return Room.join(roomNo, res);

	case "/bet":
		return Room.bet(roomNo, req, res);

	case "/ready":
		return Room.ready(roomNo, req, res);

	default:
		return Err.notFound(res);
	}
};
