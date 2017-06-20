"use strict";

var proto = require("utils/proto");

var R = require("./roulette.js");

var max = R.total - 1;

function Bets() {
	this.map = new Map();
}

proto(Bets, function place(input) {
	var self = this;
	var map = self.map;

	input.numbers.forEach(function (num) {
		var a = self.getAmount(num);
		var sum = a + input.amount;

		if (sum > 0) {
			map.set(num, sum);

		} else {
			map.delete(num);
		}
	});

}, function getAmount(number) {
	return this.map.get(number)|0;
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
