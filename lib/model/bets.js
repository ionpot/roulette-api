"use strict";

var proto = require("utils/proto");

var R = require("./roulette.js");

var max = R.total - 1;

function Bets() {
	this.map = new Map();
}

proto(Bets, function place(input) {
	var map = this.map;

	input.numbers.forEach(function (num) {
		var a = map.get(num)|0;

		map.set(num, a + input.amount);
	});
});

exports.create = function () {
	return new Bets();
};

exports.isValid = function (num) {
	if (num < 0) {
		return;
	}

	if (num > max) {
		return;
	}

	return true;
};
