"use strict";

var jr = require("utils/json-response");

var Err = require("./error-api.js");
var Input = require("./input.js");

var Room = require("../model/room.js");

function ok(res, json) {
	jr(res, 200, json);
}

function find(roomNo, res, done) {
	var room = Room.get(roomNo);

	if (room) {
		done(room);

	} else {
		Err.invalidRoom(res);
	}
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

exports.state = function (roomNo, res) {
	find(roomNo, res, function (room) {
		ok(res, {
			round: room.round,
			duration: room.duration,
			remaining: room.getRemaining(),
			maxRounds: room.rounds
		});
	});
};
