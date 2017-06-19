"use strict";

var proto = require("utils/proto");

var rooms = new Map();
var counter = 0;

function getOpt(val, def, min) {
	var num = val | 0;

	return Math.max(num || def, min);
}

function Room(obj) {
	this.number = ++counter;
	this.duration = obj.duration;
	this.rounds = obj.maxRounds;
	this.round = 1;
	this.createdAt = Date.now();
}

proto(Room, function begin() {
	return;
});

exports.create = function (json) {
	var room = new Room({
		duration: getOpt(json.duration, 20, 1),
		maxRounds: getOpt(json.maxRounds, 5, 1)
	});

	rooms.set(room.number, room);

	room.begin();

	return room;
};

exports.list = function () {
	var arr = [];
	var keys = rooms.keys();
	var key = keys.next();

	while (!key.done) {
		arr[arr.length] = key.value;

		key = keys.next();
	}

	return arr;
};
