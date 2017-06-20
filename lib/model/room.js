"use strict";

var proto = require("utils/proto");

var Player = require("./player.js");

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
	this.players = new Map();
}

proto(Room, function addPlayer(done, fail) {
	var map = this.players;

	Player.create(this.number, function (player) {
		map.set(player.id, player);

		done(player);

	}, fail);

}, function placeBet(input, done, fail) {
	var player = this.players.get(input.id);
	var valid;

	if (player) {
		valid = player.check(input);

		if (valid) {
			player.place(valid);

			done(valid);

		} else {
			fail(-1);
		}

	} else {
		fail(-2);
	}

}, function getRemaining() {
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
