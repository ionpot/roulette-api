"use strict";

var jr = require("utils/json-response");

var Input = require("./input.js");

var Room = require("../model/room.js");

function ok(res, json) {
	jr(res, 200, json);
}

exports.create = function (req, res) {
	Input.parse(req, function (json) {
		var room = Room.create(json || {});

		ok(res, {
			number: room.number,
			duration: room.duration,
			maxRounds: room.rounds
		});
	});
};

exports.list = function (res) {
	ok(res, Room.list());
};
