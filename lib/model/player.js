"use strict";

var hash = require("utils/hash");

function Player(id) {
	this.id = id;
}

exports.create = function (roomNo, done, fail) {
	var time = process.hrtime();
	var input = [
		roomNo,
		time[0],
		time[1]
	];

	hash.sha256(input.join("-"), function (hex) {
		done(new Player(hex));

	}, fail);
};
