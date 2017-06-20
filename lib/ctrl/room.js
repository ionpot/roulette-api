"use strict";

var jr = require("utils/json-response");

var Err = require("./error-api.js");
var HErr = require("./error-http.js");
var Input = require("./input.js");

var Room = require("../model/room.js");

function ok(res, json) {
	jr(res, 200, json);
}

function find(done) {
	return function(roomNo, res, req) {
		var room = Room.get(roomNo);

		if (room) {
			done(room, res, req);

		} else {
			Err.invalidRoom(res);
		}
	};
}

function findAndCheck(done) {
	return find(function (room, res, req) {
		Input.check(req, res, function (json) {
			done(json, room, res);
		});
	});
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

exports.state = find(function (room, res) {
	ok(res, {
		round: room.round,
		duration: room.duration,
		remaining: room.getRemaining(),
		maxRounds: room.rounds
	});
});

exports.join = find(function (room, res) {
	room.addPlayer(function (player) {
		ok(res, {
			id: player.id,
			remaining: room.getRemaining()
		});

	}, function () {
		HErr.internal(res);
	});
});

exports.bet = findAndCheck(function (json, room, res) {
	room.placeBet(json, function (out) {
		ok(res, out);

	}, function (code) {
		switch (code) {
		case -1:
			return Err.invalidPlayer(res);

		case -2:
			return HErr.badRequest(res);
		}
	});
});
