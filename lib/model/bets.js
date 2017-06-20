"use strict";

var proto = require("utils/proto");

var Roulette = require("./roulette.js");

var max = Roulette.total - 1;

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

}, function isEmpty() {
	return !this.map.size;

}, function clear() {
	this.map.clear();

}, function outcome(number) {
	var self = this;
	var out = {
		outcome: number,
		amount: self.getAmount(number),
		won: 0,
		lost: 0
	};

	self.map.forEach(function (amount, num) {
		if (num === number) {
			out.won = self.calculate(amount);

		} else {
			out.lost += amount;
		}
	});

	return out;

}, function calculate(amount) {
	var total = Roulette.total - 1;
	var count = this.map.size;
	var ratio = (total / count) - 1;

	return (amount * ratio)|0;
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
