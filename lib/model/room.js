"use strict";

var proto = require("utils/proto");

var Player = require("./player.js");
var Roulette = require("./roulette.js");

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

}, function getPlayer(input, done, fail) {
	var player = this.players.get(input.id);

	if (player) {
		done(player);

	} else {
		fail(-1);
	}

}, function placeBet(input, done, fail) {
	this.getPlayer(input, function (player) {
		if (player.isReady()) {
			return fail(-3);
		}

		var valid = player.check(input);

		if (valid) {
			player.place(valid);

			done(valid);

		} else {
			fail(-2);
		}

	}, fail);

}, function ready(input, done, fail) {
	this.getPlayer(input, function (player) {
		if (player.hasBets()) {
			player.ready(done);

		} else {
			fail(-2);
		}

	}, fail);

}, function getRemaining() {
	var total = this.getDuration();
	var elapsed = this.getElapsed();

	return Math.max(0, total - elapsed);

}, function getElapsed() {
	return Date.now() - this.begunAt;

}, function getDuration() {
	return this.duration * 1000;

}, function next() {
	if (this.round < this.rounds) {
		this.round += 1;

		return true;
	}

}, function begin() {
	var self = this;
	var number;
	var spun;
	var ready;

	function check() {
		if (spun && ready) {
			self.end(number);

			if (self.next()) {
				self.begin();

			} else {
				self.close();
			}
		}
	}

	self.begunAt = Date.now();

	Roulette.spin(function (num) {
		number = num;
		spun = true;

		check();
	});

	setTimeout(function () {
		ready = true;

		check();

	}, self.getDuration());

}, function end(number) {
	this.players.forEach(function (player) {
		if (player.isReady()) {
			player.notify(number);
			player.reset();
		}
	});

}, function close() {
	rooms.delete(this.number);
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
