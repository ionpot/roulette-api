"use strict";

var jr = require("utils/json-response");

function set(code, text) {
	return function (res) {
		jr(res, 422, {
			code: code,
			text: text
		});
	};
}

exports.invalidRoom = set(1, "Room doesn't exist.");
exports.invalidPlayer = set(2, "Invalid player id.");
exports.committed = set(3, "Player has committed.");
exports.noBets = set(3, "No bets are placed.");
