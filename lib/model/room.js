"use strict";

var proto = require("utils/proto");

var rooms = new Map();
var counter = 0;

function getOpt(val, def, min) {
	var num = val|0;

	return Math.max(num || def, min);
}

function Room(obj) {
	this.number = ++counter;
	this.duration = obj.duration;
	this.rounds = obj.maxRounds;
	this.round = 1;
	this.begunAt = undefined;
}

proto(Room, function getRemaining() {
	var total = this.getDuration();
	var elapsed = this.getElapsed();

	return Math.max(0, total - elapsed);

}, function getElapsed() {
	return Date.now() - this.begunAt;

}, function getDuration() {
	return this.duration * 1000;

}, function begin() {
	this.begunAt = Date.now();
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

exports.get = function (no) {
	return rooms.get(no|0);
};
